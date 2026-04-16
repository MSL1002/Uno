import React, { useState } from 'react';
import "./ComponentStyles.scss";

export default function TutorialComponent({ onBack }) {

    const [tutIndex, setTutIndex] = useState(0);

    const tutorials = [
        {
            title: "Objective",
            content: "Be the first player to get rid of all your cards."
        },
        {
            title: "Card Types",
            content: "Number Cards: 0-9 in four colors (Red, Yellow, Blue, Green).\nAction Cards: Skip, Reverse, Draw Two.\nWild Cards: Wild and Wild Draw Four - can be played anytime and let you choose the color."
        },
        {
            title: "How to Play",
            content: "Match the top card of the discard pile by color or number. If you can't match, draw a card."
        },
        {
            title: "Special Cards",
            content: "Skip: Next player's turn is skipped.\nReverse: Direction of play reverses. Draw Two: Next player draws 2 cards and loses their turn.\nWild: Change the current color.\nWild Draw Four: Change color and next player draws 4 cards."
        },
        {
            title: "Winning",
            content: "The first player to play all their cards wins the round!"
        }
    ];

    function changeIndex(direction) {
        if (direction === 'next' && tutIndex < tutorials.length - 1) {
            setTutIndex(tutIndex + 1);
        } else if (direction === 'back' && tutIndex > 0) {
            setTutIndex(tutIndex - 1);
        }
    }

    return (
        <div className="TutorialComponent">
            <button 
                className="exitbutton" 
                onClick={onBack}
            >
                X
            </button>
            <button 
                id='btnBack' 
                onClick={() => changeIndex('back')}
                disabled={tutIndex === 0}
                className="arrow-btn"
            >
                《
            </button>
            <div className="tutorial-content">
                <h2>{tutorials[tutIndex].title}</h2>
                <pre>{tutorials[tutIndex].content}</pre>
                <div className="progress-indicator">
                    {tutorials.map((_, idx) => (
                        <span 
                            key={idx} 
                            className={`dot ${idx === tutIndex ? 'active' : ''}`}
                        ></span>
                    ))}
                </div>
            </div>
            <button 
                id='btnNext' 
                onClick={() => changeIndex('next')}
                disabled={tutIndex === tutorials.length - 1}
                className="arrow-btn"
            >
                》
            </button>
        </div>
    );
}