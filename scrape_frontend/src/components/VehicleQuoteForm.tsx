import React, { useState } from "react";
import "./VehicleQuoteForm.css";

// Define the types for the form data and errors
interface FormData {
  registrationNumber: string;
  postcode: string;
  phoneNumber: string;
  problem: string;
  transmissionType: string;
  carPhoto: File | null; // Can be null or a File
}

interface FormErrors {
  registrationNumber?: string;
  postcode?: string;
  phoneNumber?: string;
  problem?: string;
  transmissionType?: string;
}

const VehicleQuoteForm: React.FC = () => {
  const [formData, setFormData] = useState <FormData> ({
    registrationNumber: "",
    postcode: "",
    phoneNumber: "",
    problem: "",
    transmissionType: "",
    carPhoto: null
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailure, setIsFailure] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<{ make: string; model: string } | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error for this field
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setFormData({ ...formData, phoneNumber: value });
    setErrors({ ...errors, phoneNumber: "" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, carPhoto: e.target.files[0] });
    }
  };

  const validateForm = () =>{
    const newErrors : FormErrors = {};
    
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration number is required.";
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required.";
    } 

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 11) {
      newErrors.phoneNumber = "Enter a valid UK phone number.";
    }

    if (!formData.transmissionType) {
      newErrors.transmissionType = "Transmission type is required.";
    }

    return newErrors;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Pre-fetch make/model before showing confirm modal
    try {
      const reg = formData.registrationNumber.replace(/\s+/g, '').toUpperCase();
      const res = await fetch(`/api/car/lookup/${reg}`);
      if (res.ok) {
        const data = await res.json();
        setVehicleInfo(data);
      }
    } catch {
      setVehicleInfo(null);
    }

    setIsConfirming(true); // show confirm modal
  };

  const submitForm = async () => {
    setIsConfirming(false);
    setLoading(true) // start loading

    // Simulate form submission and show the success modal
    try {
      const prod_url = '/api/car/submit-form';

      //create a formdata object
      const formDataToSend = new FormData();
      formDataToSend.append('registrationNumber', formData.registrationNumber);
      formDataToSend.append('postcode', formData.postcode);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('problem', formData.problem);
      formDataToSend.append('transmissionType', formData.transmissionType);

      // append the file if it exists:
      if(formData.carPhoto){
        formDataToSend.append('carPhoto', formData.carPhoto);
      }
      


      const response = await fetch(prod_url, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (data.success){
        // Use the `uniqueId` to generate the link
        // const editLink = `http://localhost:5000/edit-form/${data.carDetails.uniqueId}`;
        // console.log('Edit Link:', editLink);
        setIsSuccess(true);
      }
      else{
        console.error('Submission failed:', data);
        setIsFailure(true);
      }


    } catch (error) {
      console.error('Error submitting form:', error);
      setIsFailure(true)
    } finally{
      setLoading(false) // end loading
    }

  };

  const closeSuccessModal = () => {
    setIsSuccess(false);
    setIsFailure(false);
    setFormData({ registrationNumber: "", postcode: "", phoneNumber: "", problem: "", transmissionType: "", carPhoto: null }); // Reset the form

  };

  const backToHomePage = () => {
    setIsSuccess(false);
    setIsFailure(false);
    setFormData({ registrationNumber: "", postcode: "", phoneNumber: "", problem: "", transmissionType: "", carPhoto: null }); // Reset the form
  };

  return (
    <>
    <div className={`form-container ${isSuccess || isFailure || isConfirming ? "blur-background" : ""}`}>
      <h2>Get Paid More - Enter your reg and get an Offer that beats Scrap Value!</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Vehicle Registration</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            placeholder="Vehicle Registration Number.."
          />
          {errors.registrationNumber && (
          <div className="error-message">{errors.registrationNumber}</div>
        )}
        </div>

        <div className="form-group">
          <label className="form-label">Post Code</label>
          <input
            type="text"
            name="postcode"
            value={formData.postcode}
            onChange={handleInputChange}
            placeholder="Post Code.."
          />
          {errors.postcode && <div className="error-message">{errors.postcode}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Transmission Type</label>
          <select
            name="transmissionType"
            value={formData.transmissionType}
            onChange={handleInputChange}
          >
            <option value="">-- Select Transmission --</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
          {errors.transmissionType && <div className="error-message">{errors.transmissionType}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle issues (Clutch gone, Engine Light on, MOT failed, etc.)</label>
          <input
            type="text"
            name="problem"
            value={formData.problem}
            onChange={handleInputChange}
            placeholder="Place your issues here.."
          />
        </div>

        <div className="form-group">
        <label htmlFor="phone-number" className="form-label">Phone Number</label> 
          <div className="phone-number-field">
            <input
              type="tel"
              placeholder="e.g. 07911123456"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              maxLength={11}
            />
            {errors.phoneNumber && (
              <div className="error-message">{errors.phoneNumber}</div>
            )}
          </div>
            
        </div>

        {/* Photo Upload Feature */}
    <div className="form-group">
      <label htmlFor="car-photo" className="form-label">Upload Car Image (optional)</label>
      <input
        type="file"
        id="car-photo"
        name="carPhoto"
        accept="image/*"
        onChange={handleFileChange}
      />
      
    </div>

        <div className="form-group">
          <small>* No hidden charges for removal, paperwork or other fees</small>
        </div>
        

        <button type="submit" disabled={loading} className="submit-button">
        {loading ? (
          <>
            <span className="spinner"></span> Submitting..
          </>
        ) : (
          "Get Your Quote"
        )}
        </button>

      </form>

      <p className="footer-text">
        Download our app today to access a nationwide selection of vehicles and
        become a trusted agent in our network. Join us and unlock exciting
        opportunities!
      </p>
      <div className="app-buttons">
        <a href="www.apple.com">
        <img src="/apple_store.png" alt="App Store" />
        </a>

        <a href="www.google.com">
        <img src="/google_store.png" alt="Google Play" />
        </a>
      </div>
    </div>

    {/* Confirm Modal */}
    {isConfirming && (
      <div className="success-modal">
        <div className="modal-content">
          <span className="close-button" onClick={() => setIsConfirming(false)}>
            &times;
          </span>
          <h1>Verify Your Details</h1>
          <div style={{ textAlign: 'left', margin: '16px 0' }}>
            <p><strong>Registration:</strong> {formData.registrationNumber}</p>
            {vehicleInfo && <p><strong>Make:</strong> {vehicleInfo.make}</p>}
            {vehicleInfo && <p><strong>Model:</strong> {vehicleInfo.model}</p>}
            <p><strong>Post Code:</strong> {formData.postcode}</p>
            <p><strong>Transmission:</strong> {formData.transmissionType}</p>
            <p><strong>Issues:</strong> {formData.problem || 'None'}</p>
            <p><strong>Phone:</strong> {formData.phoneNumber}</p>
            <p><strong>Photo:</strong> {formData.carPhoto ? formData.carPhoto.name : 'None'}</p>
          </div>
          <div className="back-home-btn-container" style={{ display: 'flex', gap: '12px' }}>
            <button className="back-home-button" onClick={() => setIsConfirming(false)}>
              Edit
            </button>
            <button className="submit-button" onClick={submitForm}>
              Submit
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Success Modal */}
    {isSuccess && (
        <div className="success-modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeSuccessModal}>
              &times;
            </span>
            <div className="icon-container">
              <img src="success.png" alt="Success Icon" className="success-icon" />
            </div>
            <h1>Quote submitted Successfully!</h1>
            <p>Local Buyers will reach out to you shortly.</p>
            <p>
              Additionally, we will send a link to your phone number, allowing you to
              view, edit, or delete your posting at your convenience.
            </p>
            <div className="feedback-section">
              <div className="feedback-label">
                From where did you hear about us?
              </div>
              <select>
                <option value="not selected">--Select an Option--</option>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="friends">Friends</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Back to Home Page Button */}
            <div className="back-home-btn-container">
              <button className="back-home-button" onClick={backToHomePage}>
                Back to Home Page
              </button>
            </div>


          </div>
        </div>
      )}

      {/* Failure Modal */}
    {isFailure && (
        <div className="success-modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeSuccessModal}>
              &times;
            </span>
            <div className="icon-container">
              <img src="failure.png" alt="Failure Icon" className="success-icon" />
            </div>
            <h1>Error in Submission!</h1>
            <p>We could not submit your request.</p>
            <small>
              Please check all the inputs, including your vehicle registration number
              and phone number are correct and try again.
            </small>
            
            {/* Back to Home Page Button */}
            <div className="back-home-btn-container">
              <button className="back-home-button" onClick={backToHomePage}>
                Try Again
              </button>
            </div>


          </div>
        </div>
      )}

    </>

  );
};

export default VehicleQuoteForm;
