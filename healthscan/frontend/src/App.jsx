import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import DataDiri from "./components/DataDiri.jsx";
import GayaHidup from "./components/GayaHidup.jsx";
import Gejala from "./components/Gejala.jsx";
import Hasil from "./components/Hasil.jsx";
import Rekomendasi from "./components/Rekomendasi.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminRespondentDetail from "./admin/AdminRespondentDetail.jsx";

const STEP_COUNT = 5;

function ProgressBar({ step }) {
  return (
    <div className="progress-track no-print">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <div
          key={i}
          className={`progress-track__seg${i < step ? " is-done" : ""}${i === step - 1 ? " is-active" : ""}`}
        />
      ))}
    </div>
  );
}

function emptyWizardState() {
  return {
    step: 1,
    dataDiri: {},
    gayaHidup: {},
    gejala: [],
    hasil: null,
  };
}

function Wizard() {
  const [state, setState] = useState(emptyWizardState);

  function restart() {
    setState(emptyWizardState());
  }

  return (
    <div className="app-shell">
      <ProgressBar step={state.step} />
      <div className="main-content">
        {state.step === 1 && (
          <DataDiri
            data={state.dataDiri}
            onNext={(dataDiri) => setState({ ...state, dataDiri, step: 2 })}
          />
        )}

        {state.step === 2 && (
          <GayaHidup
            data={state.gayaHidup}
            onNext={(gayaHidup) => setState({ ...state, gayaHidup, step: 3 })}
            onBack={(gayaHidup) => setState({ ...state, gayaHidup, step: 1 })}
          />
        )}

        {state.step === 3 && (
          <Gejala
            data={state.gejala}
            onNext={(gejala) => setState({ ...state, gejala, step: 4 })}
            onBack={(gejala) => setState({ ...state, gejala, step: 2 })}
          />
        )}

        {state.step === 4 && (
          <Hasil
            dataDiri={state.dataDiri}
            gayaHidup={state.gayaHidup}
            gejala={state.gejala}
            onNext={(hasil) => setState({ ...state, hasil, step: 5 })}
            onBack={() => setState({ ...state, step: 3 })}
          />
        )}

        {state.step === 5 && state.hasil && (
          <Rekomendasi
            hasil={state.hasil}
            onBack={() => setState({ ...state, step: 4 })}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Wizard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/respondent/:id" element={<AdminRespondentDetail />} />
      </Routes>
      <Footer />
    </>
  );
}
