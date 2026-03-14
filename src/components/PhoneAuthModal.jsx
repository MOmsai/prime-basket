import { useState } from "react";
import "./PhoneLoginModal.css";
import { sendDemoPhoneOtp, verifyDemoPhoneOtp } from "../utils/demoPhoneAuth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function PhoneAuthModal({
  isOpen,
  onClose,
  apiBaseUrl,
  onLoginSuccess,
  redirectPath,
}) {
  const [step, setStep] = useState("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const baseUrl = apiBaseUrl || API_BASE_URL;

  const normalizePhone = (rawPhone) => {
    const digits = String(rawPhone || "").replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (String(rawPhone || "").startsWith("+") && digits.length >= 10) {
      return `+${digits}`;
    }
    return `+91${digits.slice(-10)}`;
  };

  const isValidIndianMobile = (rawPhone) => {
    const digits = String(rawPhone || "").replace(/\D/g, "");
    const tenDigits = digits.length === 10 ? digits : digits.slice(-10);
    return /^([6-9]\d{9})$/.test(tenDigits);
  };

  const resetForm = () => {
    setStep("PHONE");
    setPhone("");
    setOtp("");
    setError("");
    setDevOtp("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const performSendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      if (!isValidIndianMobile(phone)) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }

      const normalizedPhone = normalizePhone(phone);
      const response = await fetch(`${baseUrl}/api/auth/send-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          purpose: "LOGIN",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `HTTP ${response.status}`,
        );
      }

      if (data.devOtp || data.otp) {
        setDevOtp(data.devOtp || data.otp);
      }

      setPhone(normalizedPhone);
      setStep("OTP");
    } catch (err) {
      if (err instanceof TypeError && isValidIndianMobile(phone)) {
        try {
          const fallback = await sendDemoPhoneOtp({
            phone: normalizePhone(phone),
            purpose: "LOGIN",
          });
          setPhone(fallback.phone || normalizePhone(phone));
          setDevOtp(fallback.otp || "");
          setStep("OTP");
          setError("");
        } catch (fallbackErr) {
          setError(
            fallbackErr.message ||
              "Cannot reach server. Please try again in a moment.",
          );
        }
      } else {
        setError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    await performSendOtp();
  };

  const handleResendOtp = async () => {
    await performSendOtp();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!/^\d{6}$/.test(otp.trim())) {
        throw new Error("Enter a valid 6-digit OTP.");
      }

      let data;
      try {
        const response = await fetch(`${baseUrl}/api/auth/verify-phone-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: normalizePhone(phone),
            otp: otp.trim(),
          }),
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || `HTTP ${response.status}`,
          );
        }
      } catch (networkErr) {
        if (networkErr instanceof TypeError) {
          data = await verifyDemoPhoneOtp({
            phone: normalizePhone(phone),
            otp: otp.trim(),
          });
          setDevOtp("");
        } else {
          throw networkErr;
        }
      }

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(data);
      }

      if (redirectPath) {
        window.location.assign(redirectPath);
      }

      onClose();
      resetForm();
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Cannot reach server. Check backend URL/config and make sure backend is running.",
        );
      } else {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("PHONE");
    setOtp("");
    setError("");
    setDevOtp("");
  };

  if (!isOpen) return null;

  return (
    <div className="phone-login-overlay" onClick={handleClose}>
      <div className="phone-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phone-login-video">
          <video autoPlay loop muted playsInline className="modal-video">
            <source src="/thelogovideo.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay"></div>
        </div>

        <div className="phone-login-form-container">
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>

          <div className="phone-login-content">
            <h3>{step === "PHONE" ? "Sign In" : "Verify OTP"}</h3>
            {step === "PHONE" && (
              <div className="phone-instruction">Mobile Number</div>
            )}

            {error && <div className="error-message">{error}</div>}
            {devOtp && (
              <div className="dev-otp-display">
                <strong>OTP:</strong> {devOtp}
              </div>
            )}

            {step === "PHONE" ? (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-sent-message">
                  OTP sent to <strong>{phone}</strong>
                </div>

                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="6-digit code"
                    maxLength="6"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & SignIn"}
                </button>

                <div className="otp-actions">
                  <button
                    type="button"
                    className="link-btn"
                    onClick={handleBackToPhone}
                  >
                    ← Change Number
                  </button>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
