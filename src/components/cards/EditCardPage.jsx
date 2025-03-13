import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import url from "../commons.js";
import {Button, Form} from "react-bootstrap";

/**
 * Компонент страницы редактирования визитки.
 * Позволяет пользователю редактировать информацию о визитке и сохранять изменения.
 */
export default function EditCardPage() {
    const {id} = useParams();

    /**
     * Название визитки
     * @type {string}
     */
    const [cardName, setCardName] = useState('');

    /**
     * Полное имя
     * @type {string}
     */
    const [fullName, setFullName] = useState('');

    /**
     * Фамилия
     * @type {string}
     */
    const [surname, setSurname] = useState('');

    /**
     * Должность
     * @type {string}
     */
    const [position, setPosition] = useState('');

    /**
     * Номер телефона
     * @type {string}
     */
    const [phoneNumber, setPhoneNumber] = useState('');

    /**
     * Email
     * @type {string}
     */
    const [email, setEmail] = useState('');

    /**
     * Образование
     * @type {string}
     */
    const [degree, setDegree] = useState('');

    /**
     * О себе
     * @type {string}
     */
    const [aboutMe, setAboutMe] = useState('');

    /**
     * Адрес
     * @type {string}
     */
    const [address, setAddress] = useState('');

    /**
     * Социальные сети
     * @type {Array<Object>}
     */
    const [socialNetworks, setSocialNetworks] = useState([{}]);

    /**
     * Информация о компании
     * @type {Object}
     */
    const [companyInfo, setCompanyInfo] = useState({ companyName: '', businessLine: '', phoneNumber: '', email: '', companyWebsite: '', address: '' });

    /**
     * Сообщение об ошибке
     * @type {string}
     */
    const [error, setError] = useState("");

    /**
     * Сообщение об ошибке генерации текста
     * @type {string}
     */
    const [generateErrorText, setGenerateErrorTest] = useState("");

    /**
     * Флаг загрузки данных
     * @type {boolean}
     */
    const [loading, setLoading] = useState(true);

    /**
     * Сообщение об ошибке загрузки данных
     * @type {string}
     */
    const [loadError, setLoadError] = useState("");

    /**
     * Показывает сообщение об ошибке
     * @param {string} message - Сообщение об ошибке
     */
    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    /**
     * Показывает сообщение об ошибке генерации текста
     * @param {string} message - Сообщение об ошибке генерации
     */
    const showGenerateError = (message) => {
        setGenerateErrorTest(message)
        setTimeout(() => setGenerateErrorTest(null), 5000);
    }

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await axios.get(`${url}/card/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const cardData = response.data;

                // Заполняем поля данными из ответа
                setCardName(cardData.cardName || '');
                setFullName(cardData.fullName || '');
                setSurname(cardData.surname || '');
                setPosition(cardData.position || '');
                setPhoneNumber(cardData.phoneNumber || '');
                setEmail(cardData.email || '');
                setDegree(cardData.degree || '');
                setAboutMe(cardData.aboutMe || '');
                setAddress(cardData.address || '');

                // Обработка социальных сетей
                if (cardData.socialNetworks && cardData.socialNetworks.length > 0) {
                    setSocialNetworks(cardData.socialNetworks);
                } else {
                    setSocialNetworks([{}]);
                }

                // Обработка информации о компании
                if (cardData.companyInfo) {
                    setCompanyInfo({
                        companyName: cardData.companyInfo.companyName || '',
                        businessLine: cardData.companyInfo.businessLine || '',
                        phoneNumber: cardData.companyInfo.phoneNumber || '',
                        email: cardData.companyInfo.email || '',
                        companyWebsite: cardData.companyInfo.companyWebsite || '',
                        address: cardData.companyInfo.address || '',
                    });
                }

                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке визитки:', err);
                setLoadError("Не удалось загрузить данные визитки");
                setLoading(false);
            }
        };

        fetchCard();
    }, [id, navigate]);

    /**
     * Обрабатывает изменение социальной сети
     * @param {number} index - Индекс социальной сети
     * @param {string} field - Поле для изменения
     * @param {string} value - Новое значение
     */
    const handleSocialNetworkChange = (index, field, value) => {
        const newSocialNetworks = [...socialNetworks];
        newSocialNetworks[index][field] = value;
        setSocialNetworks(newSocialNetworks);
    };

    /**
     * Добавляет новую социальную сеть
     */
    const addSocialNetwork = () => {
        setSocialNetworks([...socialNetworks, { name: '', link: '' }]);
    };

    /**
     * Удаляет социальную сеть
     * @param {number} index - Индекс социальной сети для удаления
     */
    const removeSocialNetwork = (index) => {
        const newSocialNetworks = socialNetworks.filter((_, i) => i !== index);
        setSocialNetworks(newSocialNetworks);
    };

    /**
     * Обрабатывает изменение информации о компании
     * @param {string} field - Поле для изменения
     * @param {string} value - Новое значение
     */
    const handleCompanyInfoChange = (field, value) => {
        setCompanyInfo({
            ...companyInfo,
            [field]: value,
        });
    };

    /**
     * Обрабатывает обновление визитки
     */
    const handleUpdateCard = async () => {
        if (cardName === '' || cardName === null || fullName === null || fullName === '') {
            showError("Убедитесь, что поля 'Название визитки' и 'Имя/отчество' заполнены")
            return
        }

        const companyFieldsFilled = Object.entries(companyInfo).some(([key, value]) => key !== 'companyName' && value.trim() !== '');
        if (companyFieldsFilled && !companyInfo.companyName.trim()) {
            setError("Если заполнены поля компании, необходимо указать её название.");
            return;
        }

        const filteredSocialNetworks = socialNetworks.filter(social => social.name && social.link && social.name.trim() !== '' && social.link.trim() !== '');
        setSocialNetworks(filteredSocialNetworks);

        const cardData = {
            ...(cardName && { cardName }),
            ...(fullName && { fullName }),
            ...(surname && { surname }),
            ...(position && { position }),
            ...(phoneNumber && { phoneNumber }),
            ...(email && { email }),
            ...(degree && { degree }),
            ...(aboutMe && { aboutMe }),
            ...(address && { address }),
            ...(socialNetworks.some((social) => social.name || social.link) && {
                socialNetworks: socialNetworks
                    .filter((social) => social.name && social.link) // Фильтруем пустые объекты
                    .map((social) => ({
                        ...(social.name && { name: social.name }),
                        ...(social.link && { link: social.link }),
                    })),
            }),
            ...(Object.values(companyInfo).some((value) => value) && {
                companyInfo: {
                    ...(companyInfo.companyName && { companyName: companyInfo.companyName }),
                    ...(companyInfo.businessLine && { businessLine: companyInfo.businessLine }),
                    ...(companyInfo.phoneNumber && { phoneNumber: companyInfo.phoneNumber }),
                    ...(companyInfo.email && { email: companyInfo.email }),
                    ...(companyInfo.companyWebsite && { companyWebsite: companyInfo.companyWebsite }),
                    ...(companyInfo.address && { address: companyInfo.address }),
                },
            })
        };

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate("/login");
                return;
            }

            await axios.post(`${url}/card/${id}`, cardData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).then(response => {
                if (response.status === 200) {
                    navigate(`/cards/${id}`);
                } else if (response.status === 401) {
                    navigate('/login');
                } else {
                    setError(response.data);
                }
            }).catch(err => {
                if (err.response && err.response.status === 401) {
                    navigate("/login");
                } else {
                    showError("Ошибка при обновлении визитки");
                }
                console.log(err);
            });
        } catch (error) {
            console.error('Ошибка при обновлении визитки:', error);
            showError("Ошибка при обновлении визитки");
        }
    };

    /**
     * Генерирует текст "О себе" на основе должности и образования
     */
    const generateAboutMe = async () => {
        if (!position.trim() || !degree.trim()) {
            showGenerateError("Необходимо заполнить поля \"Должность\" и \"Образование\" для создания текста");
            return;
        }
        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(url + "/recommend/generate-about-me", {
                position,
                degree,
                companyInfo: {
                    companyName: companyInfo.companyName,
                    businessLine: companyInfo.businessLine
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setAboutMe(response.data.message);
        } catch (error) {
            console.error("Ошибка при генерации описания:", error);
            showGenerateError("Ошибка при генерации описания");
        }
    };

    if (loading) {
        return <div className="text-center mt-5 m-auto">Загрузка...</div>;
    }

    if (loadError) {
        return <div className="alert alert-danger text-center mt-5 w-25 m-auto">{loadError}</div>;
    }

    return (
        <div className="container w-25 d-flex flex-column justify-content-center align-content-center">
            <h3>Редактирование визитки</h3>
            <Form onSubmit={(e) => {e.preventDefault(); handleUpdateCard();}} >
                <Form.Group>
                    <Form.Label>Название визитки</Form.Label>
                    <Form.Control
                        type="text"
                        required={true}
                        maxLength={60}
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                    >
                    </Form.Control>
                </Form.Group>
            </Form>
            <Form.Group>
                <Form.Label>Имя/Отчество</Form.Label>
                <Form.Control type="text" maxLength={100} value={fullName} required onChange={(e) => setFullName(e.target.value)}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Фамилия</Form.Label>
                <Form.Control type="text" maxLength={60} value={surname} onChange={(e) => setSurname(e.target.value)}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Должность</Form.Label>
                <Form.Control type="text" maxLength={60} value={position} onChange={(e) => setPosition(e.target.value)}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Номер телефона</Form.Label>
                <Form.Control type="text" maxLength={30} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" maxLength={60} value={email} onChange={(e) => setEmail(e.target.value)}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>Образование</Form.Label>
                <Form.Control type="text" maxLength={60} value={degree} onChange={(e) => setDegree(e.target.value)}/>
            </Form.Group>

            <Form.Group>
                <Form.Label>О себе</Form.Label>
                <Form.Control as="textarea" value={aboutMe} style={{height: "300px"}} onChange={(e) => setAboutMe(e.target.value)}/>
                <Button onClick={generateAboutMe} style={{background: "linear-gradient(45deg, #ff6b6b, #ff8e53)", border: "none"}} className="mt-2 mb-1">
                    Сгенерировать описание
                </Button>
                {generateErrorText && (
                    <div className={"alert alert-danger text-center mt-2"}>
                        {generateErrorText}
                    </div>
                )}
            </Form.Group>

            <Form.Group>
                <Form.Label>Адрес</Form.Label>
                <Form.Control type="text" maxLength={255} value={address} onChange={(e) => setAddress(e.target.value)}/>
            </Form.Group>

            <h4>Социальные сети</h4>
            {socialNetworks.map((social, index) => (
                <Form.Group key={index} className="d-flex gap-1 align-items-center mb-2">
                    <Form.Control type="text" placeholder="Название сети" value={social.name || ''} onChange={(e) => handleSocialNetworkChange(index, 'name', e.target.value)} />
                    <Form.Control type="text" placeholder="Ссылка" value={social.link || ''} onChange={(e) => handleSocialNetworkChange(index, 'link', e.target.value)} />
                    <Button variant="danger" onClick={() => removeSocialNetwork(index)}>Удалить</Button>
                </Form.Group>
            ))}
            <Button onClick={addSocialNetwork} className="mt-1 w-auto m-auto">Добавить соц.сеть</Button>

            <h4>Информация о компании</h4>
            <Form.Group>
                <Form.Label>Название компании</Form.Label>
                <Form.Control type="text" maxLength={70} value={companyInfo.companyName} onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Направление деятельности</Form.Label>
                <Form.Control type="text" maxLength={40} value={companyInfo.businessLine} onChange={(e) => handleCompanyInfoChange('businessLine', e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Телефон компании</Form.Label>
                <Form.Control type="text" maxLength={30} value={companyInfo.phoneNumber} onChange={(e) => handleCompanyInfoChange('phoneNumber', e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Email компании</Form.Label>
                <Form.Control type="email" maxLength={50} value={companyInfo.email} onChange={(e) => handleCompanyInfoChange('email', e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Сайт компании</Form.Label>
                <Form.Control type="text" maxLength={60} value={companyInfo.companyWebsite} onChange={(e) => handleCompanyInfoChange('companyWebsite', e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Адрес компании</Form.Label>
                <Form.Control type="text" maxLength={250} value={companyInfo.address} onChange={(e) => handleCompanyInfoChange('address', e.target.value)} />
            </Form.Group>

            {error && (
                <div className={"alert alert-danger text-center mt-2"}>
                    {error}
                </div>
            )}
            <Button onClick={handleUpdateCard} type={"button"} className="mt-2 mb-3 w-50 m-auto">Сохранить изменения</Button>
        </div>
    )
}