import React, { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState(1); // 현재 단계 관리
  const [selectedTargetVariable, setSelectedTargetVariable] = useState(null); // 선택된 목적변수
  const [selectedPolicyVariable, setSelectedPolicyVariable] = useState(null); // 선택된 정책변수
  const [policyValue, setPolicyValue] = useState(''); // 정책 변수 값

  const handlePolicySubmit = () => {
    alert(`입력한 ${selectedPolicyVariable} 값: ${policyValue}`);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">👤</span>
          <span className="logo-text">Policy - Helper</span>
        </div>
        <h1>출산장려금 효과성 검토</h1>
        <div className="user-info">
          <span className="user-name">김하나</span>
          <span className="user-country">korea</span>
        </div>
      </header>
      <main className="main-content">
        <aside className="sidebar">
          {/* 목적변수 버튼 */}
          <div className="sidebar-item">
            <button
              className={`sidebar-button ${step === 2 ? 'active' : ''}`}
              onClick={() => setStep(2)}
            >
              {selectedTargetVariable
                ? `목적변수: ${selectedTargetVariable}`
                : '목적변수를 선택하세요'}
            </button>
            {step === 2 && (
              <div className="selection-container">
                <div className="target-variable-selection">
                  <h2>목적변수를 선택하세요</h2>
                  <div className="target-buttons">
                    {['합계 출산율', '고령화 비율', '노동 인구 비율'].map((variable) => (
                      <button
                        key={variable}
                        className={`button ${
                          selectedTargetVariable === variable ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setSelectedTargetVariable(variable);
                          setStep(1); // 선택 후 초기 화면으로 이동
                        }}
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 정책변수 버튼 */}
          <div className="sidebar-item">
            <button
              className={`sidebar-button ${step === 4 ? 'active' : ''}`}
              onClick={() => setStep(4)}
            >
              정책변수를 선택하세요
            </button>
            {step === 4 && (
              <div className="selection-container">
                <div className="policy-variable-selection">
                  <h2>정책변수를 선택하세요</h2>
                  <div className="policy-buttons">
                    {['출산 장려금', '양육비 보조금', '육아 휴직 지원금'].map((policy) => (
                      <button
                        key={policy}
                        className={`button ${
                          selectedPolicyVariable === policy ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedPolicyVariable(policy)}
                      >
                        {policy}
                      </button>
                    ))}
                  </div>
                  {/* 정책변수 값 입력 폼 */}
                  {selectedPolicyVariable && (
                    <div className="policy-input">
                      <h3>{selectedPolicyVariable}</h3>
                      <p>선택한 정책변수에 대한 값을 입력하세요.</p>
                      <input
                        type="number"
                        placeholder="만원 단위로 입력하세요"
                        value={policyValue}
                        onChange={(e) => setPolicyValue(e.target.value)}
                      />
                      <button className="submit-button" onClick={handlePolicySubmit}>
                        시작하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
        <section className="content">
          <div className="empty-content">
            <p>선택한 데이터가 여기에 표시됩니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
