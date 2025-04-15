import { useEffect } from "react";

const socketlink = (process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;
