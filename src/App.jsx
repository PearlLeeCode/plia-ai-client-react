import React, { useState, useEffect } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function App() {
  const [step, setStep] = useState(1); // 현재 단계 관리
  const [selectedTargetVariable, setSelectedTargetVariable] = useState(null); // 선택된 목적변수
  const [selectedYear, setSelectedYear] = useState(null); // 선택된 년도
  const [selectedPolicyVariable, setSelectedPolicyVariable] = useState(null); // 선택된 정책변수
  const [policyValue, setPolicyValue] = useState(""); // 정책 변수 값
  const [predictionData, setPredictionData] = useState(null); // 예측 데이터 상태
  const [chartData, setChartData] = useState([]); // 그래프 데이터 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // 목적변수와 정책변수 옵션 설정
  const targetVariableOptions = [
    { label: "합계 출산율", value: "합계출산율" },
    { label: "고령화 비율", value: "고령화비율" },
    { label: "노동 인구 비율", value: "노동인구비율" },
  ];

  const policyVariableOptions = [
    { label: "출산 장려금", value: "첫째아이 평균 출산장려금(KRW)" },
    { label: "양육비 보조금", value: "양육비보조금" },
    { label: "육아 휴직 지원금", value: "육아휴직급여 상한액(KRW)" },
  ];

  // 정책 변수 값 제출 및 API 호출
  const handlePolicySubmit = async () => {
    if (
      !selectedTargetVariable ||
      !selectedYear ||
      !selectedPolicyVariable ||
      !policyValue
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    // 요청 바디 구성
    const requestBody = {
      target_variable_name: selectedTargetVariable.value,
      policy_variable_name: selectedPolicyVariable.value,
      policy_value: parseFloat(policyValue),
      prediction_years: selectedYear,
    };

    try {
      const response = await fetch("http://localhost:8000/simulation/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPredictionData(data);
      setStep(5); // 그래프를 표시하는 단계로 이동
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "데이터를 불러오는데 실패하였습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 예측 데이터를 그래프 데이터로 변환
  useEffect(() => {
    if (predictionData) {
      const historicalData = predictionData.historical_data.map((item) => ({
        date: item.date,
        historicalValue: item.value,
        predictedMean: null,
        quantile_30: null,
        quantile_70: null,
      }));

      const predictionDataArray = predictionData.predictions.map((item) => ({
        date: item.date,
        historicalValue: null,
        predictedMean: item.mean,
        quantile_30: item.quantile_30,
        quantile_70: item.quantile_70,
      }));

      // 마지막 과거 값과 첫 번째 예측 값 찾기
      const lastHistoricalData = historicalData[historicalData.length - 1];
      const firstPredictionData = predictionDataArray[0];

      // 과거 데이터와 예측 데이터 사이에 연결점 추가
      const connectingPoint = {
        date: firstPredictionData.date,
        historicalValue: lastHistoricalData.historicalValue,
        predictedMean: lastHistoricalData.historicalValue,
        quantile_30: lastHistoricalData.historicalValue,
        quantile_70: lastHistoricalData.historicalValue,
      };

      const combinedData = [
        ...historicalData,
        connectingPoint,
        ...predictionDataArray,
      ];

      setChartData(combinedData);
    }
  }, [predictionData]);

  const handleYearSelection = (year) => {
    setSelectedYear(year);
    setStep(1); // 초기 단계로 이동
  };

  // "정책변수 선택하기" 버튼 클릭시 텍스트 변경 및 selection-container 닫기
  const handlePolicySelection = (policy) => {
    setSelectedPolicyVariable(policy);
    setStep(4); // 정책변수 선택 후 "시작하기" 버튼 활성화
  };

  // 정책변수 값 입력 후 "시작하기" 버튼 클릭시 버튼 텍스트 업데이트
  const handlePolicyValueSubmit = () => {
    if (!selectedPolicyVariable || !policyValue) {
      alert("정책변수와 값을 선택해야 합니다.");
      return;
    }

    // 버튼 텍스트 변경
    setStep(3); // selection-container 닫기

    // 이후에 정책변수 값 제출을 위한 로직
    handlePolicySubmit();
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
              className={`sidebar-button ${step === 2 ? "active" : ""}`}
              onClick={() => setStep(2)}
            >
              {selectedTargetVariable && selectedYear
                ? `목적변수: ${selectedTargetVariable.label}: ${selectedYear}년`
                : selectedTargetVariable
                ? `목적변수: ${selectedTargetVariable.label}`
                : "목적변수를 선택하세요"}
            </button>
            {step === 2 && (
              <div className="selection-container">
                <div className="target-variable-selection">
                  <h2>목적변수를 선택하세요</h2>
                  <div className="target-buttons">
                    {targetVariableOptions.map((variable) => (
                      <button
                        key={variable.value}
                        className={`button ${
                          selectedTargetVariable &&
                          selectedTargetVariable.value === variable.value
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => setSelectedTargetVariable(variable)}
                      >
                        {variable.label}
                      </button>
                    ))}
                  </div>
                  {/* 년도 버튼 */}
                  {selectedTargetVariable && (
                    <div className="year-buttons">
                      <h3>년도 선택</h3>
                      {[1, 2, 3, 4, 5].map((year) => (
                        <button
                          key={year}
                          className={`button ${
                            selectedYear === year ? "selected" : ""
                          }`}
                          onClick={() => handleYearSelection(year)}
                        >
                          {`${year}년`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 정책변수 버튼 */}
          <div className="sidebar-item">
            <button
              className={`sidebar-button ${step === 4 ? "active" : ""}`}
              onClick={() => setStep(4)}
            >
              {selectedPolicyVariable
                ? `정책변수: ${selectedPolicyVariable.label}: ${policyValue}`
                : "정책변수를 선택하세요"}
            </button>
            {step === 4 && (
              <div className="selection-container">
                <div className="policy-variable-selection">
                  <h2>정책변수를 선택하세요</h2>
                  <div className="policy-buttons">
                    {policyVariableOptions.map((policy) => (
                      <button
                        key={policy.value}
                        className={`button ${
                          selectedPolicyVariable &&
                          selectedPolicyVariable.value === policy.value
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handlePolicySelection(policy)}
                      >
                        {policy.label}
                      </button>
                    ))}
                  </div>
                  {/* 정책변수 값 입력 폼 */}
                  {selectedPolicyVariable && (
                    <div className="policy-input">
                      <h3>{selectedPolicyVariable.label}</h3>
                      <p>선택한 정책변수에 대한 값을 입력하세요.</p>
                      <input
                        type="number"
                        placeholder="숫자 값을 입력하세요"
                        value={policyValue}
                        onChange={(e) => setPolicyValue(e.target.value)}
                      />
                      <button
                        className="submit-button"
                        onClick={handlePolicyValueSubmit}
                      >
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
          {isLoading ? (
            <div className="loading">
              <p>데이터를 불러오는 중입니다...</p>
            </div>
          ) : predictionData ? (
            <div className="chart-container">
              <LineChart width={800} height={400} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="historicalValue"
                  stroke="#8884d8"
                  name="과거 데이터"
                />
                <Line
                  type="monotone"
                  dataKey="predictedMean"
                  stroke="#82ca9d"
                  name="예측 평균"
                />
                <Line
                  type="monotone"
                  dataKey="quantile_30"
                  stroke="#ffc658"
                  name="30% 분위"
                />
                <Line
                  type="monotone"
                  dataKey="quantile_70"
                  stroke="#ff7300"
                  name="70% 분위"
                />
              </LineChart>
            </div>
          ) : (
            <div className="empty-content">
              <p>선택한 데이터가 여기에 표시됩니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
