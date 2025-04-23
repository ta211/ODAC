import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AudioManager } from "./components/AudioManager";
import ChatbotPage from './components/ChatbotPage';
import { useTranscriber } from "./hooks/useTranscriber";

function HomePage() {
    const transcriber = useTranscriber();

    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className='container flex flex-col justify-center items-center'>
                <h1 className='text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl text-center'>
                    Whisper Web
                </h1>
                <h2 className='mt-3 mb-5 px-4 text-center text-1xl font-semibold tracking-tight text-slate-900 sm:text-2xl'>
                    ML-powered speech recognition directly in your browser
                </h2>
                <AudioManager transcriber={transcriber} />
                {/* <Transcript transcribedData={transcriber.output} /> */}

                <Link to='/chatbot'>
                    <button className='mt-5 px-4 py-2 bg-blue-500 text-white rounded'>
                        Go to Chatbot
                    </button>
                </Link>
            </div>

            <div className='absolute bottom-4'>
                Made with{" "}
                <a
                    className='underline'
                    href='https://github.com/hugginface/transformers.js'
                >
                    🤗 Transformers.js
                </a>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/chatbot' element={<ChatbotPage />} />
            </Routes>
        </Router>
    )
}

export default App;
