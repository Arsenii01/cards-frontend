import {BrowserRouter, Route, Routes} from "react-router-dom";
import AuthPage from "./components/AuthPage.jsx";
import CardsPage from "./components/cards/CardsPage.jsx";
import Menu from "./components/Menu.jsx";
import CreateCardPage from "./components/cards/CreateCardPage.jsx";
import CardPage from "./components/cards/CardPage.jsx";
import EditCardPage from "./components/cards/EditCardPage.jsx";

function App() {

    return (
        <>
            <BrowserRouter>
                <Menu/>
                <Routes>
                    <Route path='/' element={<CardsPage/>}/>
                    <Route path='/login' element={<AuthPage/>}/>
                    <Route path='/cards' element={<CardsPage/>}/>
                    <Route path='/cards/add' element={<CreateCardPage/>}/>
                    <Route path='/cards/:id' element={<CardPage/>}/>
                    <Route path='/cards/edit/:id' element={<EditCardPage/>}/>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
