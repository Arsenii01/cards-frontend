import {useEffect, useState} from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import url from "../commons.js";
import {Button, ListGroup, ListGroupItem, Modal} from "react-bootstrap";

function CardsPage() {
    const [cards, setCards] = useState([])
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [deleteError, setDeleteError] = useState("")
    const showError = (message) => {
        setError(message);
    };
    const getCards = () => {
        const token = localStorage.getItem('token')
        if (token === null) {
            navigate("/login")
        }
        axios.get(url + "/card", {
            headers: {
                "Authorization": "Bearer " + token
            }
        }).then(response => {
            if (response.status === 200) {
                console.log(response.data)
                setCards([...response.data])
            } else {
                navigate("/login");
            }
        }).catch(err => {
            if (err.code === "ERR_NETWORK") {
                showError("Произошла непредвиденная ошибка при загрузке списка визиток.")
                console.log(err)
            } else {
                localStorage.removeItem('token')
                navigate('/login')
            }
        })

    }


    const handleDeleteClick = (cardId) => {
        setCardToDelete(cardId);
        setShowConfirm(true);
    };

    const showDeleteError = (message) => {
        setDeleteError(message)
        setTimeout(() => setDeleteError(null), 5000)
    }

    const confirmDelete = () => {
        if (!cardToDelete) return;
        axios.delete(url + `/card/${cardToDelete}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('token')
            }
        }).then(response => {
            if (response.status === 200) {
                setCards(cards.filter(card => card.cardId !== cardToDelete));
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

    useEffect(() => {
        getCards()
    }, [setCards]);

    return (
        <div className={"container d-flex align-items-center justify-content-center flex-column"}>
            <h2 className={"mt-2"}>Мои визитки</h2>
            <Button variant="primary" onClick={() => navigate("/cards/add")}>
                Добавить визитку
            </Button>
            {cards.length !== 0 ?
                <ListGroup className={"w-25 p-3"}>
                    { cards.map(card => (
                    <ListGroupItem variant={"light"}
                                   key={card.cardId}
                                   className={"p-3 d-flex justify-content-between align-items-center"}
                                   onMouseEnter={ () => setHoveredCard(card.cardId)}
                                   onMouseLeave={() => setHoveredCard(null)}>
                        <Link to={'/cards/' + card.cardId} className="list-group-item list-group-item-action list-group-item-primary">
                            {card.cardName}
                        </Link>
                        {hoveredCard === card.cardId && (
                            <Button variant="danger" className="ml-2" onClick={() => handleDeleteClick(card.cardId)}>
                                Удалить
                            </Button>
                        )}
                    </ListGroupItem>
                    ))
                    }
                </ListGroup>
                : <div className="text-center py-5">
                    <i className="fas fa-id-card fa-3x text-muted mb-3"></i>
                    <p className="text-muted">У вас пока нет визиток. Нажмите "Добавить визитку", чтобы создать новую.</p>
                </div>
            }
            {error && (
                <div className={"alert alert-danger text-center mt-4"}>
                    {error}
                </div>
            )}

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
        </div>
    )
}

export default CardsPage