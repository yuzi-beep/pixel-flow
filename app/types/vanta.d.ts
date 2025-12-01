// Type declarations for Vanta.js
declare module 'vanta/dist/vanta.net.min' {
    interface VantaNetOptions {
        el: HTMLElement;
        THREE: any;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        scaleMobile?: number;
        color?: number;
        backgroundColor?: number;
        points?: number;
        maxDistance?: number;
        spacing?: number;
    }

    interface VantaEffect {
        destroy: () => void;
    }

    export default function NET(options: VantaNetOptions): VantaEffect;
}

declare module 'vanta/dist/vanta.waves.min' {
    interface VantaWavesOptions {
        el: HTMLElement;
        THREE: any;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        scaleMobile?: number;
        color?: number;
        shininess?: number;
        waveHeight?: number;
        waveSpeed?: number;
        zoom?: number;
    }

    interface VantaEffect {
        destroy: () => void;
    }

    export default function WAVES(options: VantaWavesOptions): VantaEffect;
}

declare module 'vanta/dist/vanta.fog.min' {
    interface VantaFogOptions {
        el: HTMLElement;
        THREE: any;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        highlightColor?: number;
        midtoneColor?: number;
        lowlightColor?: number;
        baseColor?: number;
        blurFactor?: number;
        speed?: number;
        zoom?: number;
    }

    interface VantaEffect {
        destroy: () => void;
    }

    export default function FOG(options: VantaFogOptions): VantaEffect;
}
