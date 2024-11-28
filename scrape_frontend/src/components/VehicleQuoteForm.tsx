import React, { useState } from "react";
import "./VehicleQuoteForm.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const VehicleQuoteForm: React.FC = () => {
  const [formData, setFormData] = useState({
    registration: "",
    postcode: "",
    phoneNumber: "",
    problem: "",
  });

  const [isSuccess, setIsSuccess] = useState(false); // To control the success modal visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (value: string) => {
    console.log('Phone number:', value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // alert(JSON.stringify(formData, null, 2));
    // Simulate form submission and show the success modal
    setIsSuccess(true);
  };

  const closeSuccessModal = () => {
    setIsSuccess(false);
    setFormData({ registration: "", postcode: "", phoneNumber: "", problem: "" }); // Reset the form

    
  };

  const backToHomePage = () => {
    setIsSuccess(false); 
    setFormData({ registration: "", postcode: "", phoneNumber: "", problem: "" }); // Reset the form
  };

  return (
    <>
    <div className={`form-container ${isSuccess ? "blur-background" : ""}`}>
      <h2>Get Paid More - Enter your reg and get an Offer that beats Scrap Value!</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vehicle Registration</label>
          <input
            type="text"
            name="registration"
            value={formData.registration}
            onChange={handleChange}
            placeholder="Vehicle Registration Number.."
          />
        </div>

        <div className="form-group">
          <label>Post Code</label>
          <input
            type="text"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            placeholder="Post Code.."
          />
        </div>

        <div className="form-group">
          <label>Vehicle issues (Clutch gone, Engine Light on, MOT failed, etc.)</label>
          <input
            type="text"
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            placeholder="Place your issues here.."
          />
        </div>

        <div className="form-group">
        <label htmlFor="phone-number">Phone Number</label> 
          <div className="phone-number-field">
            <PhoneInput
            country="gb" // Default country code (UK)
            onChange={handlePhoneChange}
            inputClass="phone-input"
            buttonClass="phone-dropdown"
            value={formData.phoneNumber}
          />
         </div>
            
        </div>

        <div className="form-group">
          <small>* No hidden charges for removal, paperwork or other fees</small>
        </div>

        {/* <div className="form-group">
          <label>Problem</label>
          <textarea
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            placeholder="Problem (e.g., Clutch gone, Engine Light on, MOT failed, etc.)"
          ></textarea>
        </div> */}

        {/* <div className="form-group">
          <label>Engine Running?</label>
          <div className="radio-groups-container">
          <div className="radio-group1">
            <label>
              <input
                type="radio"
                name="engineRunning"
                value="Yes"
                checked={formData.engineRunning === "Yes"}
                onChange={handleChange}
              />
              Yes
            </label>
          </div>

          <div className="radio-group2">

            <label>
              <input
                type="radio"
                name="engineRunning"
                value="No"
                checked={formData.engineRunning === "No"}
                onChange={handleChange}
              />
              No
            </label>
            </div>
          </div>
          
        </div> */}

        <button type="submit" className="submit-button">
          Get your Quote
        </button>
      </form>

      <p className="footer-text">
        Download our app today to access a nationwide selection of vehicles and
        become a trusted agent in our network. Join us and unlock exciting
        opportunities!
      </p>
      <div className="app-buttons">
        <a href="www.apple.com">
        <img src="/apple.png" alt="App Store" />
        </a>

        <a href="www.google.com">
        <img src="/google.png" alt="Google Play" />
        </a>
      </div>
    </div>

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
              view, edit, or directly connect with local agents at your convenience.
            </p>
            <div className="feedback-section">
              <div className="feedback-label">
                From where did you hear about us?
              </div>
              <select>
                <option value="facebook">Facebook</option>
                <option value="google">Google</option>
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

    </>

  );
};

export default VehicleQuoteForm;
