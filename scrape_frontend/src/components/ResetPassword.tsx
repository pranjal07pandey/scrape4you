import React, { useState, useRef } from "react";
import axios from "axios";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

// Firebase web config — fill in your project's values
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

type Step = "phone" | "otp" | "newPassword" | "done";

const ResetPassword: React.FC = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [firebaseIdToken, setFirebaseIdToken] = useState("");
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const setupRecaptcha = () => {
    const auth = getAuth();
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    try {
      // Check the phone has an account on our backend first
      const res = await axios.post("/api/auth/request-otp", { phone });
      if (!res.data.success) {
        setError(res.data.message || "No account found with this number.");
        setLoading(false);
        return;
      }

      // Trigger Firebase OTP
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(getAuth(), phone, verifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);
    try {
      const credential = await confirmationResult!.confirm(otp);
      const token = await credential.user.getIdToken();

      // Confirm with backend that this phone has an account
      await axios.post("/api/auth/verify-firebase-phone", {
        firebaseIdToken: token,
      });

      setFirebaseIdToken(token);
      setStep("newPassword");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put("/api/auth/reset-password", {
        firebaseIdToken,
        password,
      });

      if (res.data.success) {
        setStep("done");
      } else {
        setError(res.data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>

        {step === "phone" && (
          <form onSubmit={handleSendOtp}>
            <label style={styles.label}>Phone Number</label>
            <input
              style={styles.input}
              type="tel"
              placeholder="+447..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <div id="recaptcha-container" ref={recaptchaRef} />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p style={styles.info}>Enter the 6-digit code sent to {phone}</p>
            <label style={styles.label}>OTP</label>
            <input
              style={styles.input}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              style={styles.linkButton}
              type="button"
              onClick={() => { setStep("phone"); setError(""); }}
            >
              Change number
            </button>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handleResetPassword}>
            <label style={styles.label}>New Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <p style={styles.success}>Password reset successfully!</p>
            <a href="/login" style={styles.linkButton}>Back to Login</a>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "0.3rem",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "0.65rem 0.8rem",
    marginBottom: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#1a73e8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  linkButton: {
    display: "block",
    marginTop: "0.75rem",
    textAlign: "center",
    background: "none",
    border: "none",
    color: "#1a73e8",
    cursor: "pointer",
    fontSize: "0.9rem",
    textDecoration: "underline",
  },
  error: {
    color: "#d32f2f",
    fontSize: "0.875rem",
    marginBottom: "0.75rem",
  },
  success: {
    color: "#388e3c",
    fontSize: "1.1rem",
    marginBottom: "1rem",
  },
  info: {
    color: "#555",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
};

export default ResetPassword;
