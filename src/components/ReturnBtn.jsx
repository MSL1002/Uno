import { useNavigate } from "react-router-dom";
import "./ComponentStyles.scss";

export default function ReturnBtn() {

    let navigate = useNavigate();


    const routeChange =  () => {
        navigate('/');
    }

    return <button class="exitbutton" onClick={routeChange}>X</button>;
}