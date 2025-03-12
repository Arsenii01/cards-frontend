import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
function AuthPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResendButton, setShowResendButton] = useState(false);
    const inputRefs = useRef([]);

    const navigate = useNavigate();

    const showError = (message) => {
        setError(message);
        setShowResendButton(message === "Код подтверждения истёк");
        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/cards");
        }
    }, [navigate]);

    const handleCodeChange = (index, value) => {
        if (value.length > 1) return;
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newCode = [...code];
            for (let i = 0; i < pastedData.length; i++) {
                newCode[i] = pastedData[i];
            }
            setCode(newCode);
        }
    };

    useEffect(() => {
        if (code.every(digit => digit !== "") && code.join("").length === 6) {
            verifyCode();
        }
    }, [code]);

    const sendEmail = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8080/auth/send-code", { email }, { timeout: 5000});
            if (response.data.errorMessage) {
                showError(response.data.errorMessage);
            } else if (response.status === 200) {
                setStep(2);
            }
        } catch (error) {
            showError("Ошибка отправки кода подтверждения. Повторите попытку позже");
            console.error("Ошибка отправки кода", error);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyCode = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8080/auth/verify", { email, code: code.join("") });
            if (response.data.errorMessage) {
                showError(response.data.errorMessage);
            } else if (response.data.token !== null) {
                localStorage.setItem("token", response.data.token);
                navigate("/cards");
            }
        } catch (error) {
            showError("Неожиданнная ошибка при аутентификации");
            console.error("Ошибка верификации", error);
        } finally {
            setIsLoading(false);
        }
    };

    const resendCode = async () => {
        setIsLoading(true);
        setCode(["", "", "", "", "", ""]);
        try {
            const response = await axios.post("http://localhost:8080/auth/send-code", { email }, { timeout: 5000});
            if (response.data.errorMessage) {
                showError(response.data.errorMessage);
            } else if (response.status === 200) {
                setShowResendButton(false);
            }
        } catch (error) {
            showError("Ошибка отправки кода подтверждения. Повторите попытку позже");
            console.error("Ошибка отправки кода", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className="container">
          <div className="d-flex min-vh-100 justify-content-center align-items-center position-relative ">
              <div className="d-flex flex-column justify-content-center align-items-center w-50 p-4 shadow ">
                  <h2 className="text-center mb-4">Вход в аккаунт</h2>
                  {step === 1 && (
                    <>
                        <div className="mb-3 w-50">
                            <input
                              type="email"
                              className="form-control"
                              placeholder="Введите email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                          onClick={sendEmail}
                          className="btn btn-primary w-50"
                          disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                "Далее"
                            )}
                        </button>
                    </>
                  )}
                  {step === 2 && (
                    <>
                        <h6>Введите код подтверждения, отправленный на почту {email}</h6>
                        <div className="d-flex gap-2 mb-3">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="1"
                                    className="form-control text-center"
                                    style={{width: "45px", height: "45px", fontSize: "1.5rem"}}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                />
                            ))}
                        </div>
                        {isLoading && (
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}
                        {showResendButton && (
                            <button
                                onClick={resendCode}
                                className="btn btn-outline-primary mt-2"
                                disabled={isLoading}
                            >
                                Отправить код повторно
                            </button>
                        )}
                    </>
                  )}
                  {error && <div className="alert alert-danger text-center mt-5 position-absolute top-0">{error}</div>}
              </div>
          </div>
      </div>
    );
}

export default AuthPage;
