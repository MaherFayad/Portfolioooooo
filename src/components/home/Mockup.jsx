import React from 'react';
import 'html5-device-mockups/dist/device-mockups.min.css';
import { MacbookPro } from 'react-device-mockups';

export const Mockup = () => {
    return (
        <MacbookPro
            width={'80vw'}
            orientation='landscape'
            color='black'
            wrapperProps={{ style: { marginLeft: '10vw',marginRight: '10vw' } }}
            screenProps={{ style: { pointerEvents: 'auto' } }}
        >
        <iframe
            title="showcase"
            src="https://iconize.ca"
            style={{
                width: "100%",
                height: "100%",
                margin: 0,
                overflow: 'auto', // Add this CSS property to enable scrolling
                zIndex: 1000

            }}
            allow="fullscreen" // Add 'allow' attribute to enable interaction
            ></iframe>
        </MacbookPro>
    );
}
