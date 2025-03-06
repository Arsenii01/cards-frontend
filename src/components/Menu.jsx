import {Link, useLocation, useNavigate} from "react-router-dom";
import {Button, Container, Navbar} from "react-bootstrap";

export default function Menu() {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.clear()
        navigate("/login");
    };

    const location = useLocation()
    if (location.pathname === '/login') return null;

    return (
        <Navbar className={"w-25 m-auto"} bg='light'>
            <Container style={{"justify-content": "space-evenly"}}>
                <Link className={"nav-link"} to={'/cards'}>Визитки</Link>

                <Button kind="secondary" onClick={logout}>
                    Выйти из аккаунта
                </Button>
            </Container>
        </Navbar>
    )
}