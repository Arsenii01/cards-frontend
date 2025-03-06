import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
function AuthPage() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    useEffect(() => {
        if (localStorage.getItem("token")) {
            navigate("/cards");
        }
    }, [navigate]);

    const sendEmail = async () => {
        try {
            const response = await axios.post("http://localhost:8080/auth/send-code", { email }, { timeout: 5000});
            if (response.status === 200) setStep(2);
            else showError("Ошибка отправки кода подтверждения. Повторите попытку позже");
        } catch (error) {
            showError("Ошибка отправки кода подтверждения. Повторите попытку позже");
            console.error("Ошибка отправки кода", error);
        }
    };

    const verifyCode = async () => {
        try {
            const response = await axios.post("http://localhost:8080/auth/verify", { email, code });
            if (response.data.token !== null) {
                localStorage.setItem("token", response.data.token);
                navigate("/cards");
            } else {
                showError("Код неверный. Попробуйте ещё раз");
            }
        } catch (error) {
            showError("Неожиданнная ошибка при аутентификации");
            console.error("Ошибка верификации", error);
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
                        >
                            Далее
                        </button>
                    </>
                  )}
                  {step === 2 && (
                    <>
                        <h6>Введите код подтверждения, отправленный на почту</h6>
                        <div className="mb-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Введите код"
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <button
                          onClick={verifyCode}
                          className="btn btn-success w-50"
                        >
                            Подтвердить
                        </button>
                    </>
                  )}
                  {error && <div className="alert alert-danger text-center mt-5 position-absolute top-0">{error}</div>}
              </div>

          </div>

      </div>

    );
}

export default AuthPage;
