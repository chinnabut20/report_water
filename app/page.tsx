"use client";

import React, { useRef, useState, useEffect } from "react";
import { ExportButton } from "./components/ExportButton";
import {
  fetchReservoirData, ReservoirData,
  fetchDamData, DamData,
  fetchWaterData, WaterData,
  fetchRainfallMockData,
  fetchSoilMoistureMockData,
  fetchSPEIMockData
} from "./services/waterDataService";

export default function Home() {
  const reportRef = useRef<HTMLDivElement>(null);

  // State for Reservoir Data (Container 3)
  const [reservoirData, setReservoirData] = useState<any[]>([]);
  // State for Dam Data (Container 4)
  const [damData, setDamData] = useState<any[]>([]);
  // State for Water Station Data (Container 5)
  const [waterData, setWaterData] = useState<any[]>([]);

  // State for Mock Basin Data
  const [basins, setBasins] = useState<any[]>([]);
  const [selectedBasinId, setSelectedBasinId] = useState<string>("");
  const [rainfallMock, setRainfallMock] = useState<any>(null);
  const [soilMoistureMock, setSoilMoistureMock] = useState<any>(null);
  const [speiMock, setSpeiMock] = useState<any>(null);

  // Derived data based on selection
  const selectedRainfall = rainfallMock?.data?.find((b: any) => b.sub_basin_id === selectedBasinId);
  const selectedSoilMoisture = soilMoistureMock?.data?.find((b: any) => b.sub_basin_id === selectedBasinId);
  const selectedSpei = speiMock?.data?.find((b: any) => b.sub_basin_id === selectedBasinId);

  // Helper to format date for display (e.g., 2026-02-27 -> 27/02/69)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const yearBE = parseInt(y) + 543;
    return `${d}/${m}/${String(yearBE).slice(-2)}`;
  };

  // Helper to get color based on index (to match the variety in the original design)
  const getItemColor = (index: number) => {
    const colors = ["#d69999", "#dfbc7d", "#cd9cba", "#77a479", "#d19772", "#84b9d8", "#9d8ac4"];
    return colors[index % colors.length];
  };

  // Helper for Soil Moisture Status Color
  const getSoilMoistureColor = (status: string) => {
    if (status.includes("น้อยมาก")) return "#fff3a2";
    if (status.includes("น้อย")) return "#abfac1";
    if (status.includes("ปานกลาง")) return "#c5fffa";
    if (status.includes("มากที่สุด")) return "#aac9f8";
    if (status.includes("มาก")) return "#9ae7ff";
    return "#e5e7eb"; // fallback (Gray for no data)
  };

  // Helper for SPEI Status Color
  const getSPEIColor = (status: string) => {
    if (status.includes("แล้งรุนแรงมาก")) return "#ab5252";
    if (status.includes("แล้งรุนแรง")) return "#d65c59";
    if (status.includes("แล้งปานกลาง")) return "#ffc05a";
    if (status.includes("แล้งน้อย")) return "#fcfd71";
    return "#00b050"; // ปกติ / ชุ่มชื้น
  };


  // Calculate Average/Sum
  const totalRainfall = selectedRainfall?.daily_records?.reduce((sum: number, r: any) => sum + r.rainfall_mm, 0) || 0;
  const avgSoilMoisture = selectedSoilMoisture?.daily_records?.length
    ? (selectedSoilMoisture.daily_records.reduce((sum: number, r: any) => sum + r.soil_moisture, 0) / selectedSoilMoisture.daily_records.length)
    : 0;


  // Target list of reservoirs in specific order
  const TARGET_RESERVOIRS = [
    "อ่างเก็บน้ำแม่แหลงหลวง",
    "อ่างเก็บน้ำห้วยเดื่อ",
    "อ่างเก็บน้ำแม่ทะลบหลวง",
    "อ่างเก็บน้ำห้วยแม่ข้อน",
    "อ่างเก็บน้ำแม่โก๋น",
    "อ่างเก็บน้ำห้วยแม่ออน",
    "อ่างเก็บน้ำแม่จอกหลวง",
    "อ่างเก็บน้ำห้วยมะนาว",
    "อ่างเก็บน้ำโป่งจ้อ",
    "อ่างเก็บน้ำสันหนอง",
    "อ่างเก็บน้ำแม่ตูบ"
  ];

  // Target list of dams in specific order
  const TARGET_DAMS = [
    "เขื่อนแม่งัดสมบูรณ์ชล",
    "เขื่อนแม่กวง"
  ];

  // Target list of Water Stations with positions matching the diagram
  const TARGET_WATER_STATIONS = [
    // Left Side
    { name: "สถานีสะพานห้วยแม่สาว", style: { top: "23.2%", left: "32.2%", width: "160px", height: "95px" } },
    { name: "สถานีแม่อาย", style: { top: "31.7%", left: "29.8%", width: "150px", height: "90px" } },
    { name: "สถานีบ้านช่อแล", style: { top: "39.5%", left: "32.2%", width: "160px", height: "95px" } },
    { name: "สถานีฮอด", style: { top: "49.5%", left: "25.9%", width: "140px", height: "90px" } },
    { name: "สถานีสันทราย", style: { top: "58.8%", left: "24.7%", width: "140px", height: "80px" } },
    { name: "สถานีสะพานบ้านแม่สา", style: { top: "70.7%", left: "25%", width: "150px", height: "90px" } },
    { name: "สถานีทต.ทุ่งสะโตก", style: { top: "79.3%", left: "25%", width: "150px", height: "90px" } },

    // Right Side
    { name: "สถานีเชียงดาว", style: { top: "30.7%", right: "29.8%", width: "160px", height: "95px" } },
    { name: "สถานีบ้านเชียงดาว", style: { top: "39.5%", right: "25.4%", width: "150px", height: "90px" } },
    { name: "สถานีแม่แตง", style: { top: "48.5%", right: "24.7%", width: "155px", height: "85px" } },
    { name: "สถานีฝ่ายส่งน้ำและบำรุงรักษาที่ 2", displayName: "สถานีฝ่ายส่งน้ำและ\nบำรุงรักษาที่ 2", nameStyle: { fontSize: "8px" }, style: { top: "56.5%", right: "24.7%", width: "155px", height: "90px" } },
    { name: "สถานีบ้านแม่แต", displayName: "สถานีบ้านแม่แต\n*สถานีเฝ้าระวัง", nameStyle: { fontSize: "8px" }, style: { top: "64.2%", right: "37.7%", width: "160px", height: "95px" } },
    { name: "สถานีสะพานนวรัฐ", displayName: "สถานีสะพานนวรัฐ\n*สถานีเตือนภัย", nameStyle: { fontSize: "8px" }, style: { top: "73%", right: "29.0%", width: "160px", height: "95px" } },
    { name: "สถานีสะพานห้วยแม่ตาช้าง", displayName: "สถานีสะพานห้วย\nแม่ตาช้าง", style: { top: "81%", right: "31.3%", width: "160px", height: "100px" } },
  ];


  // Helper to determine image based on value for Reservoir
  const getReservoirImage = (val: number | string) => {
    if (val === "-" || typeof val !== 'number') return "/ResNodata.png";
    if (val <= 10) return "/ResYellow.png";
    if (val <= 30) return "/ResGreen.png";
    if (val <= 70) return "/ResBlue.png";
    if (val <= 100) return "/ResRed.png";
    return "/ResDarkred.png";
  };

  // Helper for Dam Color (Container 4)
  const getDamColor = (val: number | string) => {
    if (val === "-" || typeof val !== 'number') return "#b4b4b4";
    if (val <= 10) return "#fcfd71";
    if (val <= 30) return "#78d491";
    if (val <= 70) return "#6c9cde";
    if (val <= 100) return "#d65c59";
    return "#ab5252";
  };

  // Helper for Water Station Tag Image (Container 5)
  const getWaterTagImage = (textLevel: string) => {
    if (!textLevel || textLevel === "ไม่มีข้อมูล") return "/tag_gray.png";
    if (textLevel.includes("น้ำน้อยวิกฤต")) return "/tag_yellow.png";
    if (textLevel.includes("น้ำน้อย")) return "/tag_green.png";
    if (textLevel.includes("น้ำปกติ")) return "/tag_blue.png";
    if (textLevel.includes("น้ำมาก")) return "/tag_red.png";
    if (textLevel.includes("น้ำล้นตลิ่ง")) return "/tag_darkred.png";
    return "/tag_gray.png";
  };

  // Helper for Water Station Text Color
  const getWaterTagTextColor = (textLevel: string) => {
    if (textLevel.includes("น้ำมาก") || textLevel.includes("น้ำล้นตลิ่ง")) {
      return "text-white";
    }
    return "text-black";
  };

  // Fetch Data from Service
  useEffect(() => {
    const loadData = async () => {
      // Fetch Reservoir Data
      const resData = await fetchReservoirData();

      // Merge with Target List
      const mergedReservoirData = TARGET_RESERVOIRS.map(targetName => {
        const found = resData?.find(d => d.name === targetName);
        return found ? found : { name: targetName, val: "-" };
      });
      setReservoirData(mergedReservoirData);

      // Fetch Dam Data
      const dData = await fetchDamData();

      // Merge with Target List (Default to "ไม่มีข้อมูล")
      const mergedDamData = TARGET_DAMS.map(targetName => {
        // loose match or exact match depending on API consitency (using includes for broader match if needed)
        const found = dData?.find(d => d.name.includes(targetName) || targetName.includes(d.name));
        return found ? found : { name: targetName, val: "-", textLevel: "ไม่มีข้อมูล" };
      });
      setDamData(mergedDamData);

      // 3. Fetch Water Data
      const wData = await fetchWaterData();
      const mergedWaterData = TARGET_WATER_STATIONS.map(target => {
        // Using 'includes' for broader matching since API names might vary slightly
        const found = wData?.find(d => d.name.includes(target.name) || target.name.includes(d.name));
        return {
          ...target,
          val: found ? found.val : "-",
          textLevel: found ? found.textLevel : ""
        };
      });
      setWaterData(mergedWaterData);

      // 4. Fetch Mock Data
      const rMock = await fetchRainfallMockData();
      const sMock = await fetchSoilMoistureMockData();
      const speiData = await fetchSPEIMockData(); // Fetch SPEI data

      setRainfallMock(rMock);
      setSoilMoistureMock(sMock);
      setSpeiMock(speiData); // Set SPEI mock data

      if (rMock && rMock.data) {
        setBasins(rMock.data.map((b: any) => ({ id: b.sub_basin_id, name: b.sub_basin_name })));
        if (!selectedBasinId) setSelectedBasinId(rMock.data[0].sub_basin_id);
      }
    };

    loadData();
  }, [selectedBasinId]);


  return (
    <main className="min-h-screen min-w-full w-fit font-prompt relative">
      <ExportButton targetRef={reportRef} fileNamePrefix="water-report" />

      <div ref={reportRef} className="custom-bg p-4 md:p-8 min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-2"
          style={{
            textShadow: "2px 2px 0px #4b5563",
            WebkitTextStroke: "1px black"
          }}>
          สถานการณ์ฝน น้ำ และภัยแล้ง รายสัปดาห์
        </h1>


        {selectedRainfall && (
          <h2 className="text-[32px] font-bold text-center text-[#c1ff72] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mb-2">
            {selectedRainfall.sub_basin_name}
          </h2>
        )}


        {/* Basin Selector (Floating at Top Left) */}
        <div className="fixed top-6 left-6 z-[100] no-export print:hidden">
          <div className="bg-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/40 shadow-2xl transition-all hover:bg-white/20 w-52">
            <div className="relative">
              <select
                value={selectedBasinId}
                onChange={(e) => setSelectedBasinId(e.target.value)}
                className="w-full bg-[#004aad]/5 border border-[#004aad]/20 text-[#004aad] rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#004aad]/30 appearance-none cursor-pointer shadow-sm transition-all"
              >
                {basins.map((b) => (
                  <option key={b.id} value={b.id} className="text-black">
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none text-[#004aad]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>






        {/* Content area */}
        <div className="w-full max-w-[1600px] min-w-[1360px] mx-auto border border-white shadow-sm bg-transparent">

          {/* Container 1: GPM Satellite Rain */}
          <div className="relative w-full overflow-hidden p-4 border-b border-white z-0">
            <div className="absolute inset-0 -z-10">
              <img
                src="/rain.gif"
                alt="Background GPM Animated"
                className="w-full h-full object-cover absolute inset-0"
                style={{ opacity: 0.6 }}
              />
            </div>
            {/* Header */}
            <div className="mb-4 pl-2">
              <h2
                className="text-xl md:text-2xl font-normal text-white whitespace-nowrap"
                style={{ textShadow: "1.5px 1.5px 0px #4b5563" }}
              >
                ปริมาณฝนจากดาวเทียม GPM
              </h2>
            </div>

            {/* Floating Label: 7 Days Past */}
            <div className="absolute top-[45px] left-4 md:top-[50px] md:left-6 z-10">
              <p className="text-xl md:text-2xl font-normal text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">:<span className="ml-6 text-[#c1ff72] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">7 วันที่ผ่านมา</span></p>
            </div>

            <div className="flex flex-row gap-2 items-stretch">
              {/* Left Box: Summary */}
              <div className="flex-shrink-0 w-[350px] flex flex-col justify-between items-start text-left p-2 pt-0 pl-2 pr-0">
                <div className="relative flex flex-col justify-start items-start ml-28">
                  <div className="absolute -top-1 -right-8 w-40 h-40 flex flex-col items-center justify-center">
                    <img
                      src="/water.png"
                      alt="Rain Icon"
                      className="absolute inset-0 w-full h-full object-contain z-0"
                    />
                    <span className="text-[30px] md:text-[38px] font-black text-[#004aad] drop-shadow-sm relative z-10 font-mono">
                      {totalRainfall.toFixed(1)}
                    </span>
                    <span className="text-sm text-[#004aad] relative z-10">
                      มิลลิเมตร
                    </span>
                  </div>
                  <div className="invisible flex flex-col items-start" aria-hidden="true">
                    <span className="text-[30px] md:text-[40px] font-black font-mono">{totalRainfall.toFixed(1)}</span>
                    <span className="text-sm">มิลลิเมตร</span>
                  </div>
                </div>
              </div>

              {/* Right Box: 7 Days Grid */}
              <div className="flex-grow grid grid-cols-7 gap-2 w-full min-w-[800px] -ml-21 -mt-1">
                {(selectedRainfall?.daily_records || []).map((item: any, index: number) => (
                  <div key={index} className="flex flex-col gap-2">
                    {/* Top Box: Value */}
                    <div
                      style={{
                        borderColor: getItemColor(index),
                        backgroundColor: "rgba(255, 255, 255, 0.8)"
                      }}
                      className="relative flex-grow flex flex-col items-center justify-end pb-2 p-2 rounded-xl border-2 backdrop-blur-sm shadow-sm h-24 md:h-28"
                    >
                      <div className="relative bg-[#aae5f8] border-2 border-white rounded-lg px-2 py-0.5 mb-1 shadow-sm w-20 flex items-center justify-center">
                        <img
                          src="/25.png"
                          alt="water"
                          className="absolute -top-12 -right-7 scale-50"
                        />
                        <span className="text-xl md:text-2xl font-bold text-[#004aad] whitespace-nowrap font-mono">{item.rainfall_mm.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-[#545454] font-medium whitespace-nowrap">มิลลิเมตร</span>
                    </div>
                    {/* Bottom Box: Date */}
                    <div
                      style={{
                        borderColor: getItemColor(index),
                        color: "#004aad",
                        backgroundColor: "rgba(255, 255, 255, 0.8)"
                      }}
                      className="w-full text-center rounded-full py-1 text-xs font-bold shadow-sm border-2 whitespace-nowrap"
                    >
                      <span className="font-mono">{formatDateForDisplay(item.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Label: Accumulated */}
            <div className="absolute bottom-2 left-4 md:bottom-4 md:left-10 z-10 pointer-events-none">
              <p className="text-white md:text-[18px] font-normal drop-shadow-md">สะสม ทั้งสัปดาห์</p>
            </div>
          </div>

          {/* Container 2: SMAP Satellite Soil Moisture */}
          <div className="relative w-full p-4 border-b border-white z-0 bg-white">
            <div className="absolute inset-0 -z-10">
              <img
                src="/BGsoilmoisture.png"
                alt="Background soil moisture"
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
            {/* Header */}
            <div className="mb-4 pl-2">
              <h2
                className="text-xl md:text-2xl font-normal text-white whitespace-nowrap"
                style={{ textShadow: "1.5px 1.5px 0px #4b5563" }}>
                ความชื้นผิวดินจากดาวเทียม SMAP
              </h2>
            </div>

            {/* Floating Label: 7 Days Past */}
            <div className="absolute top-[45px] left-4 md:top-[50px] md:left-6 z-10">
              <p className="text-xl md:text-2xl font-normal text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">:<span className="ml-6 text-[#c1ff72] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">7 วันที่ผ่านมา</span></p>
            </div>

            <div className="flex flex-row gap-4 items-stretch">
              {/* Left Box: Summary */}
              <div className="flex-shrink-0 w-[350px] flex flex-col justify-end items-start text-left p-2 pt-0 pl-2">
                <div className="relative flex flex-col justify-start items-start ml-24">
                  <div className="absolute -top-46 -left-30 w-72 h-72 flex flex-col items-center justify-center pointer-events-none">
                    <img
                      src="/Swamp.gif"
                      alt="SMAP Icon"
                      className="w-full h-full object-contain z-0"
                    />
                  </div>
                  <div className="absolute -top-12 -left-6 z-20 flex flex-row items-end gap-2">
                    <span className="text-4xl md:text-[36px] font-black text-blue-900 drop-shadow-sm italic font-mono">{avgSoilMoisture.toFixed(2)}</span>
                    <span className="text-sm text-slate-700 pb-2">m³/m³</span>
                  </div>
                  <div className="invisible flex flex-row items-end gap-2 ml-4">
                    <span className="text-4xl md:text-[36px] font-black italic font-mono">{avgSoilMoisture.toFixed(2)}</span>
                    <span className="text-sm pb-2">m³/m³</span>
                  </div>
                </div>
              </div>

              {/* Right Box: 7 Days Grid */}
              <div className="flex-grow grid grid-cols-7 gap-2 w-full min-w-[800px] -ml-23 -mt-1">
                {(selectedSoilMoisture?.daily_records || []).map((item: any, index: number) => (
                  <div key={index} className="relative flex flex-col gap-2">
                    {/* Independent Status Label (Top Right of the day column) */}
                    <div
                      style={{
                        backgroundColor: "#efeded",
                        borderColor: "#dfbc7d"
                      }}
                      className="absolute -top-3 -right-1 w-[80px] border-2 rounded-lg py-1 shadow-sm z-30 flex items-center justify-center min-h-[50px] bg-white"
                    >
                      <div className="flex flex-col items-center justify-center leading-[1.1]">
                        <span className="text-[12px] font-bold text-black">ความชื้น</span>
                        <span className="text-[16px] font-black text-[#1c5baf]">
                          {item.status.replace("ความชื้นผิวดิน", "")}
                        </span>
                      </div>
                    </div>

                    {/* Top Box: Value */}
                    <div
                      style={{
                        borderColor: getItemColor(index),
                        backgroundColor: "rgba(255, 255, 255, 0.8)"
                      }}
                      className="relative flex-grow flex flex-col items-center justify-end pb-2 p-2 rounded-xl border-2 backdrop-blur-sm shadow-sm h-24 md:h-28"
                    >
                      <div
                        style={{ backgroundColor: getSoilMoistureColor(item.status) }}
                        className="relative border-2 border-white rounded-lg px-2 py-0.5 mb-1 shadow-sm w-20 flex items-center justify-center"
                      >
                        <img
                          src="/26.png"
                          alt="water"
                          className="absolute -top-12 -left-8 scale-50"
                        />
                        <span className="text-xl md:text-2xl font-bold text-[#004aad] italic whitespace-nowrap font-mono">{item.soil_moisture.toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-[#545454] font-medium whitespace-nowrap">m³/m³</span>
                    </div>
                    {/* Bottom Box: Date */}
                    <div
                      style={{
                        borderColor: getItemColor(index),
                        color: "#004aad",
                        backgroundColor: "rgba(255, 255, 255, 0.8)"
                      }}
                      className="w-full text-center rounded-full py-1 text-xs font-bold shadow-sm border-2 whitespace-nowrap"
                    >
                      <span className="font-mono">{formatDateForDisplay(item.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Label: Average */}
            <div className="absolute top-42 -translate-y-1/2 left-[80px] z-10 pointer-events-none">
              <p className="text-[#816649] md:text-[18px] font-medium drop-shadow-md">เฉลี่ย ทั้งสัปดาห์</p>
            </div>
          </div>

          {/* Containers 3, 4, 5: Water Storage & Level (Grid of 3) */}
          <div className="relative z-0 grid grid-cols-3 gap-0 border-b border-white bg-white">
            {/* Container 3: Reservoir */}
            <div className="relative min-h-[650px] p-2 flex flex-col items-center justify-start text-center border-r border-white">
              <div className="absolute inset-0 -z-10">
                <img
                  src="/BGReservoir.png"
                  alt="Background Reservoir"
                  className="w-full h-full object-cover object-top absolute inset-0"
                />
              </div>
              <div className="w-full mb-0 mt-4">
                <h2 className="text-xl md:text-2xl font-normal text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] whitespace-nowrap">ปริมาณน้ำกักเก็บ</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white text-xl font-bold">:</span>
                  <span className="text-[#c5fffa] text-2xl font-bold drop-shadow-md">อ่างเก็บน้ำ</span>
                </div>
                <p className="text-[#545454] text-sm mt-1">- ปริมาณน้ำ (%) ณ ปัจจุบัน -</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-0 w-[90%] mx-auto px-0 content-start mt-4">
                {reservoirData.map((dam, i) => (
                  <div key={i} className="relative w-full h-[85px] group cursor-pointer">
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                      <img
                        src={getReservoirImage(dam.val)}
                        alt={dam.name}
                        className="w-full h-full object-contain scale-[1.35]"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center z-10 mt-1">
                      <span className="text-[20px] font-black text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.9)]">
                        <span className="font-mono">{dam.val}</span> %
                      </span>
                    </div>
                    <div className="absolute -bottom-1 w-full text-center z-20 pointer-events-none">
                      <p className="text-[10px] md:text-xs text-black font-normal leading-tight drop-shadow-sm inline-block px-1">
                        {dam.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Container 4: Dam */}
            <div className="relative min-h-[650px] p-2 flex flex-col items-center justify-start text-center border-r border-white">
              <div className="absolute inset-0 -z-10">
                <img
                  src="/BGReservoir.png"
                  alt="Background Dam"
                  className="w-full h-full object-cover object-top absolute inset-0"
                />
              </div>
              <div className="w-full mb-0 mt-4">
                <h2 className="text-xl md:text-2xl font-normal text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] whitespace-nowrap">ปริมาณน้ำกักเก็บ</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white text-xl font-bold">:</span>
                  <span className="text-[#c5fffa] text-2xl font-bold drop-shadow-md">เขื่อน</span>
                </div>
                <p className="text-[#545454] text-sm mt-1">- ปริมาณน้ำ (%) ณ ปัจจุบัน -</p>
              </div>

              <div className="flex flex-col w-full h-full gap-4 px-4 mt-9">
                {damData.map((dam, index) => (
                  <div key={index} className="flex flex-col items-center w-full mt-4 first:mt-0">
                    <div className="flex w-full justify-center gap-8 items-end mb-1">
                      <span className="text-xl font-normal text-black">{dam.name}</span>
                      <span className="text-2xl font-black" style={{ color: getDamColor(dam.val) }}><span className="font-mono">{dam.val}</span> %</span>
                    </div>
                    <div className="relative w-full h-[120px] mb-2 mt-2">
                      {/* Assuming we use the same generic Dam image for all, or we could add logic if needed */}
                      <img
                        src="/Dam.png"
                        alt={dam.name}
                        className="w-full h-full object-contain scale-[2.5]"
                      />
                    </div>
                    <div
                      className="rounded-full w-[160px] h-[36px] flex items-center justify-center shadow-md mt-2"
                      style={{ backgroundColor: getDamColor(dam.val) }}
                    >
                      <span className="text-white font-normal text-lg">{dam.textLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Container 5: Water Station */}
            <div className="relative min-h-[650px] w-full p-0 overflow-hidden">
              <div className="absolute inset-0 -z-10">
                <img
                  src="/BGReservoir.png"
                  alt="Background Water Station"
                  className="w-full h-full object-cover object-top absolute inset-0"
                />
              </div>
              <div className="w-full mb-0 mt-4 absolute top-0 z-30 text-center">
                <h2 className="text-xl md:text-2xl font-normal text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] whitespace-nowrap">ระดับน้ำ</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white text-xl font-bold">:</span>
                  <span className="text-[#c5fffa] text-2xl font-bold drop-shadow-md">ณ สถานีวัดน้ำ</span>
                </div>
                <p className="text-[#545454] text-sm mt-1">- ระดับน้ำ (ม.รทก.) ณ ปัจจุบัน -</p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-10 w-full h-[85%] flex items-end justify-center">
                <div className="relative w-full h-full scale-[1.37] -translate-y-19">
                  <img
                    src="/S.png"
                    alt="Water Level Data"
                    className="w-full h-full object-contain object-bottom"
                  />

                  {/* Data Labels Layer */}
                  <div className="absolute inset-0 z-20 w-full h-full max-w-[1000px] mx-auto left-0 right-0">
                    {waterData.map((station, index) => {
                      const isLeftSide = 'left' in station.style;
                      const tagImage = getWaterTagImage(station.textLevel);
                      const textColorClass = getWaterTagTextColor(station.textLevel);

                      return (
                        <div
                          key={index}
                          className={`absolute flex items-center justify-center ${isLeftSide ? '-translate-x-1/2' : 'translate-x-1/2'} transform drop-shadow-md z-20`}
                          style={{ ...station.style, transform: undefined }}
                        >
                          {/* Tag Image Background */}
                          <img
                            src={tagImage}
                            alt="tag"
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ transform: isLeftSide ? 'scaleX(-1)' : undefined }}
                          />

                          {/* Text Overlay */}
                          <div className={`relative z-10 flex flex-col items-center justify-center pb-0 ${isLeftSide ? '-translate-x-[10px]' : 'translate-x-[10px]'}`}>
                            <p
                              className={`text-[8px] font-normal leading-tight whitespace-pre-line text-center ${textColorClass}`}
                              style={station.nameStyle}
                            >
                              {station.displayName || station.name}
                            </p>
                            <p
                              className={`text-[10px] font-black whitespace-nowrap ${textColorClass}`}
                              style={station.valStyle}
                            >
                              {station.val !== "-" ? <><span className="font-mono">{station.val}</span> ม. รทก.</> : "-"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full border-b border-white">

            {/* Container 6: พยากรณ์ฝน */}
            <div className="relative w-full h-[260px] overflow-hidden p-4 border-b border-white">
              <div className="absolute inset-0">
                <img
                  src="/rainandcloud.gif"
                  alt="Background GPM Animated"
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>

              {/* Image & Data Wrapper */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                {/* Visual Image */}
                <div className="relative w-64 h-64 z-0">
                  <img
                    src="/layout.png"
                    alt="Rain Icon"
                    className="w-full h-full object-contain scale-[4] -translate-y-4"
                  />
                </div>

                {/* Data Overlay Layer - 1100px width ref */}
                <div className="absolute z-10 w-[1100px] h-full top-0">
                  <div className="relative w-full h-full">
                    {/* Manual positioning for 8 items */}
                    {[
                      { val: "10.0", date: "02/11/68", left: "4%" },
                      { val: "12.0", date: "09/11/68", left: "16%" },
                      { val: "15.0", date: "16/11/68", left: "27.5%" },
                      { val: "18.0", date: "23/11/68", left: "39%" },
                      { val: "20.0", date: "30/11/68", left: "50.5%" },
                      { val: "16.0", date: "07/12/68", left: "62%" },
                      { val: "14.0", date: "14/12/68", left: "74%" },
                      { val: "8.0", date: "21/12/68", left: "85.5%" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="absolute top-0 h-full flex flex-col items-center justify-center pb-4 translate-y-12"
                        style={{ left: item.left, width: '10%' }}
                      >
                        {/* Value Group - pushed down to align with boxes */}
                        <div className="flex flex-col items-center mt-6">
                          <span className="text-[28px] font-bold text-[#545454] leading-none font-mono">{item.val}</span>
                          <span className="text-[16px] text-[#545454] mt-1">- มม. -</span>
                        </div>

                        {/* Date Group - pushed down */}
                        <div className="mt-12 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                          <span className="text-[12px] font-bold text-black font-mono">{item.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-20 flex flex-col items-center justify-start w-full h-full pointer-events-none">
                <div
                  style={{
                    backgroundColor: "rgba(0, 74, 173, 0.6)",
                    borderColor: "rgba(255, 255, 255, 0.4)"
                  }}
                  className="px-6 py-2 rounded-full border backdrop-blur-md shadow-xl mb-4"
                >
                  <h3 className="text-white text-lg md:text-xl font-normal drop-shadow-md text-center whitespace-nowrap">
                    พยากรณ์ ฝน รายสัปดาห์ ล่วงหน้า 2 เดือน (8 สัปดาห์)
                  </h3>
                </div>
              </div>
            </div>

            {/* Container 7: พยากรณ์แล้ง (6-Month SPEI Forecast) */}
            <div className="relative w-full h-[280px] overflow-hidden p-4 border-b border-white bg-white/50 backdrop-blur-sm">
              <div className="absolute inset-0">
                <img
                  src="/drought.gif"
                  alt="Background Drought"
                  className="w-full h-full object-cover opacity-60"
                />
              </div>

              {/* Data Overlay Layer - 1250px width ref */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pt-20">
                <div className="flex gap-4 items-center">
                  {(selectedSpei?.forecast_6_months || []).map((item: any, i: number) => {
                    const [year, month] = item.month.split("-");
                    const monthNamesThai = [
                      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
                      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
                    ];
                    const thaiMonthName = monthNamesThai[parseInt(month) - 1];
                    const thaiYear = parseInt(year) + 543;

                    return (
                      <div key={i} className="flex flex-col items-center group">
                        {/* Hexagon Wrapper for Thick White Border */}
                        <div
                          className="relative w-[150px] h-[134px] flex items-center justify-center transition-all duration-300 hover:scale-110 drop-shadow-xl"
                          style={{
                            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                            backgroundColor: "white",
                          }}
                        >
                          {/* Inner Colored Hexagon */}
                          <div
                            className="relative w-[140px] h-[124px] text-white"
                            style={{
                              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                              backgroundColor: getSPEIColor(item.status),
                              opacity: 0.8, // Increased transparency
                            }}
                          >
                            {/* Value (Independently Centered) */}
                            <div className="absolute inset-x-0 top-[35%] flex justify-center">
                              <span className="text-[32px] font-black drop-shadow-md font-mono leading-none">{item.value.toFixed(2)}</span>
                            </div>

                            {/* Month/Year Label (Independently Bottom-aligned) */}
                            <div className="absolute inset-x-0 bottom-1 flex justify-center">
                              <span className="text-[14px] font-bold whitespace-nowrap drop-shadow-md">{thaiMonthName} {thaiYear}</span>
                            </div>

                            {/* Glossy Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                          </div>
                        </div>


                        {/* Status Label Below Hexagon (Styled like Container 6 date labels) */}
                        <div className="mt-4 flex flex-col items-center leading-none">
                          <div className="bg-white/90 px-3 py-1 rounded-full shadow-sm">
                            <span className="text-[12px] font-bold text-black">
                              {item.status}
                            </span>
                          </div>
                        </div>



                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Float Header */}
              <div className="relative z-20 flex flex-col items-center justify-start w-full pointer-events-none">
                <div
                  style={{
                    backgroundColor: "rgba(221, 82, 82, 0.8)",
                    borderColor: "rgba(255, 255, 255, 0.4)"
                  }}
                  className="px-8 py-2 rounded-full border backdrop-blur-md shadow-xl mt-2"
                >
                  <h3 className="text-white text-lg md:text-xl font-bold drop-shadow-md text-center">
                    พยากรณ์ดัชนีภัยแล้ง SPEI ล่วงหน้า 6 เดือน
                  </h3>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}