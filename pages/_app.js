import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        fetch("/api/socket");
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;
