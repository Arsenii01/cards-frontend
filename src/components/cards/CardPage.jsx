import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import url from "../commons.js";
import {Button, Col, Container, Modal, Row} from "react-bootstrap";
import {QRCodeSVG} from 'qrcode.react';

/**
 * Компонент страницы отдельной визитки.
 * Отображает информацию о визитке и позволяет управлять ею.
 */
export default function CardPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    /**
     * Данные визитки
     * @type {Object|null}
     */
    const [card, setCard] = useState(null);

    /**
     * Флаг загрузки данных
     * @type {boolean}
     */
    const [loading, setLoading] = useState(true);

    /**
     * Сообщение об ошибке
     * @type {string|null}
     */
    const [error, setError] = useState(null);

    /**
     * Показывает модальное окно подтверждения удаления
     * @type {boolean}
     */
    const [showConfirm, setShowConfirm] = useState(false);

    /**
     * ID визитки для удаления
     * @type {number|null}
     */
    const [cardToDelete, setCardToDelete] = useState(null);

    /**
     * Сообщение об ошибке удаления
     * @type {string}
     */
    const [deleteError, setDeleteError] = useState("")

    /**
     * Обрабатывает нажатие на кнопку удаления визитки
     * @param {number} cardId - ID визитки для удаления
     */
    const handleDeleteClick = (cardId) => {
        setCardToDelete(cardId);
        setShowConfirm(true);
    };

    /**
     * Подтверждает удаление визитки
     */
    const confirmDelete = () => {
        if (!cardToDelete) return;
        axios.delete(url + `/card/${cardToDelete}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('token')
            }
        }).then(response => {
            if (response.status === 200) {
                navigate("/cards")
            } else {
                showDeleteError("Произошла ошибка при удалении визитки.");
            }
        }).catch(err => {
            showDeleteError("Произошла непредвиденная ошибка при удалении визитки.");
            console.log(err);
        }).finally(() => {
            setShowConfirm(false);
            setCardToDelete(null);
        });
    };

    /**
     * Устанавливает сообщение об ошибке удаления
     * @param {string} message - Сообщение об ошибке удаления
     */
    const showDeleteError = (message) => {
        setDeleteError(message)
        setTimeout(() => setDeleteError(null), 5000)
    }

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`${url}/card/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setCard(response.data);
            } catch (err) {
                setError("Ошибка загрузки визитки");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [id]);

    /**
     * Копирует ссылку на визитку в буфер обмена
     */
    const copyLink = () => {
        if (card) {
            navigator.clipboard.writeText(`http://localhost:8080/card-landing/${card.landingId}`);
            alert("Ссылка скопирована!");
        }
    };

    if (loading) return <p className={"text-center m-auto"}>Загрузка...</p>;
    if (error) return (<>{error && (
        <div className={"alert alert-danger text-center mt-4 w-25 m-auto"}>
            {error}
        </div>
    )}</>);

    return (
        <>
            <Container className="d-flex flex-column align-items-center mt-4">
                <h4 className={"mb-0"}>{card?.fullName}</h4>
                <h4 className={"mb-0"}>{card?.position}</h4>
                <h5 className={"mt-0 mb-0"}>{card?.phoneNumber}</h5>
                <h5 className={"mt-0 mb-1"}>{card?.email}</h5>

                <div className="mb-3">
                    <QRCodeSVG value={`http://localhost:8080/card-landing/${card?.landingId}`} size={196}/>

                </div>

                <Row className="w-25">
                    <Col className="d-flex justify-content-center mb-2">
                        <Button onClick={copyLink} variant="info"
                                className="w-100 d-inline-flex align-items-center justify-content-center">Скопировать
                            ссылку</Button>
                    </Col>
                    <Col className="d-flex justify-content-center mb-2">
                        <Button href={`http://localhost:8080/card-landing/${card?.landingId}`} target={'_blank'}
                                className="w-100 d-inline-flex align-items-center justify-content-center">Посмотреть
                            визитку</Button>
                    </Col>
                </Row>
                <Row className="w-25">
                    <Col className="d-flex justify-content-center mb-2">
                        <Button onClick={() => navigate(`/cards/edit/${id}`)} variant="outline-primary"
                                className="w-100 d-inline-flex justify-content-center">Редактировать визитку</Button>
                    </Col>
                    <Col className="d-flex justify-content-center mb-2">
                        <Button onClick={() => handleDeleteClick(card.cardId)} variant="danger"
                                className="w-100 d-inline-flex align-items-center justify-content-center">Удалить
                            визитку</Button>
                    </Col>
                </Row>
            </Container>
            {deleteError && (
                <div className={"alert alert-danger text-center mt-4"}>
                    {deleteError}
                </div>
            )}
            {/* Модальное окно подтверждения удаления */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>

                <Modal.Body>Вы уверены, что хотите удалить эту визитку?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    );
}
