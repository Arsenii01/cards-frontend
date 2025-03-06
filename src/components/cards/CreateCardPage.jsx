import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import url from "../commons.js";
import {Button, Form} from "react-bootstrap";

export default function CreateCardPage() {
    const [cardName, setCardName] = useState('');
    const [fullName, setFullName] = useState('');
    const [surname, setSurname] = useState('');
    const [position, setPosition] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [degree, setDegree] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [address, setAddress] = useState('');
    const [socialNetworks, setSocialNetworks] = useState([{}]);
    const [companyInfo, setCompanyInfo] = useState({ companyName: '', businessLine: '', phoneNumber: '', email: '', companyWebsite: '', address: '' });

    const [error, setError] = useState("");
    const [generateErrorText, setGenerateErrorTest] = useState("")

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(null), 5000);
    };

    const showGenerateError = (message) => {
        setGenerateErrorTest(message)
        setTimeout(() => setGenerateErrorTest(null), 5000);

    }

    const navigate = useNavigate()


    const handleSocialNetworkChange = (index, field, value) => {
        const newSocialNetworks = [...socialNetworks];
        newSocialNetworks[index][field] = value;
        setSocialNetworks(newSocialNetworks);
    };

    const addSocialNetwork = () => {
        setSocialNetworks([...socialNetworks, { name: '', link: '' }]);
    };

    const removeSocialNetwork = (index) => {
        const newSocialNetworks = socialNetworks.filter((_, i) => i !== index);
        setSocialNetworks(newSocialNetworks);
    };



    const handleCompanyInfoChange = (field, value) => {
        setCompanyInfo({
            ...companyInfo,
            [field]: value,
        });

        console.log(companyInfo)
    };

    const handleCreateCard = async () => {
        console.log(companyInfo)
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
                navigate("/login")
            }

            const response = await axios.post(url + '/card', cardData, {
                headers: {
                    Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
                },
            }).then(response => {
                if (response.status === 200) {
                    navigate('/cards')
                } else if (response.status === 401) {
                    navigate('/login')
                } else {
                    setError(response.data)
                }
            }).catch(err => {
                navigate("/login")
                console.log(err)
            });

            console.log('Визитка успешно создана:', response.data);
        } catch (error) {
            console.error('Ошибка при создании визитки:', error);
        }
    };

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
                    Authorization: `Bearer ${token}`, // Добавляем токен в заголовок
                }
            });

            setAboutMe(response.data.message);
        } catch (error) {
            console.error("Ошибка при генерации описания:", error);
            showError("Ошибка при генерации описания");
        }
    };

    return (
        <div className="container w-25 d-flex flex-column justify-content-center align-content-center">
            <h3>Создание визитки</h3>
            <Form onSubmit={handleCreateCard} >
                <Form.Group>
                    <Form.Label>Название визитки</Form.Label>
                    <Form.Control
                        type="text"
                        required={true}
                        maxLength={60}
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
                <Form.Control as="textarea" value={aboutMe}  style={{height: "300px;"}} onChange={(e) => setAboutMe(e.target.value)}/>
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
                    <Form.Control type="text" placeholder="Название сети" value={social.name} onChange={(e) => handleSocialNetworkChange(index, 'name', e.target.value)} />
                    <Form.Control type="text" placeholder="Ссылка" value={social.link} onChange={(e) => handleSocialNetworkChange(index, 'link', e.target.value)} />
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
            <Button onClick={handleCreateCard} type={"submit"} className="mt-2 mb-3 w-50 m-auto">Создать визитку</Button>

        </div>
    )
}