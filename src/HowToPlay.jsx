import TutorialComponent from "./components/TutorialComponent";
import "./components/ComponentStyles.scss";

export default function HowToPlay({ onBack }) {
    return (
        <div className="HowToPlay" id="center">
            <h1>How To Play</h1>
            <TutorialComponent onBack={onBack} />
        </div>
    );
}