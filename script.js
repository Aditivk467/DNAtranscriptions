const CODON_TABLE = {
    "UUU": "Phe", "UUC": "Phe", "UUA": "Leu", "UUG": "Leu",
    "CUU": "Leu", "CUC": "Leu", "CUA": "Leu", "CUG": "Leu",
    "AUU": "Ile", "AUC": "Ile", "AUA": "Ile", "AUG": "Met",
    "GUU": "Val", "GUC": "Val", "GUA": "Val", "GUG": "Val",
    "UCU": "Ser", "UCC": "Ser", "UCA": "Ser", "UCG": "Ser",
    "CCU": "Pro", "CCC": "Pro", "CCA": "Pro", "CCG": "Pro",
    "ACU": "Thr", "ACC": "Thr", "ACA": "Thr", "ACG": "Thr",
    "GCU": "Ala", "GCC": "Ala", "GCA": "Ala", "GCG": "Ala",
    "UAU": "Tyr", "UAC": "Tyr", "UAA": "Stop", "UAG": "Stop",
    "CAU": "His", "CAC": "His", "CAA": "Gln", "CAG": "Gln",
    "AAU": "Asn", "AAC": "Asn", "AAA": "Lys", "AAG": "Lys",
    "GAU": "Asp", "GAC": "Asp", "GAA": "Glu", "GAG": "Glu",
    "UGU": "Cys", "UGC": "Cys", "UGA": "Stop", "UGG": "Trp",
    "CGU": "Arg", "CGC": "Arg", "CGA": "Arg", "CGG": "Arg",
    "AGU": "Ser", "AGC": "Ser", "AGA": "Arg", "AGG": "Arg",
    "GGU": "Gly", "GGC": "Gly", "GGA": "Gly", "GGG": "Gly",
};

const AMINO_ACID_FULL_NAMES = {
    "Phe": "Phenylalanine",      "Leu": "Leucine",
    "Ile": "Isoleucine",         "Met": "Methionine (Start)",
    "Val": "Valine",             "Ser": "Serine",
    "Pro": "Proline",            "Thr": "Threonine",
    "Ala": "Alanine",            "Tyr": "Tyrosine",
    "Stop": "Stop Codon",        "His": "Histidine",
    "Gln": "Glutamine",          "Asn": "Asparagine",
    "Lys": "Lysine",             "Asp": "Aspartic Acid",
    "Glu": "Glutamic Acid",      "Cys": "Cysteine",
    "Trp": "Tryptophan",         "Arg": "Arginine",
    "Gly": "Glycine",
};

const BASE_COLORS = {
    "A": "#f87171", "T": "#60a5fa", "G": "#4ade80", "C": "#c084fc", "U": "#fbbf24"
};

// Cache Elements after rendering context initializes
let dnaTextarea, resultsPanel;

// CodePen Initializer 
function init() {
    dnaTextarea = document.getElementById("dna-textarea");
    resultsPanel = document.getElementById("results-panel");

    if (dnaTextarea) {
        dnaTextarea.addEventListener("input", runGeneticPipeline);
    }

    initializeCodonDatabaseTable();
    runGeneticPipeline();
}

// Fire initialization safely
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// Navigation through Engine Switcher 
function switchPage(targetPageId) {
    document.querySelectorAll('.page').forEach(element => {
        element.classList.remove('active');
    });
    document.querySelectorAll('.nav-option').forEach(element => {
        element.classList.remove('active');
    });
    
    document.getElementById(`page-${targetPageId}`)?.classList.add('active');
    document.getElementById(`btn-${targetPageId}`)?.classList.add('active');
}

//  Data Processing w/ Math Engines 
function stripIllegalBases(sequence) {
    return sequence.toUpperCase().replace(/[^ATCG]/g, "");
}
// Removing invalid characters 
function executeTranscription(dnaSequence) {
    const complementRules = {"A": "U", "T": "A", "G": "C", "C": "G"};
    return dnaSequence.split("").map(base => complementRules[base] || "?").join("");
}

function executeTranslation(mrnaSequence) {
    let proteinArray = [];
    for (let i = 0; i < mrnaSequence.length - 2; i += 3) {
        const structuralCodon = mrnaSequence.substring(i, i + 3);
        proteinArray.push(CODON_TABLE[structuralCodon] || "?");
    }
    return proteinArray;
}

function calculateGCPercentage(sequence) {
    if (!sequence.length) return 0.0;
    const matches = (sequence.match(/[GC]/g) || []).length;
    return (matches / sequence.length) * 100;
}

function generateRandomDNA() {
    const baseLibrary = "ATCG";
    let chainOutput = "";
    for (let i = 0; i < 36; i++) {
        chainOutput += baseLibrary.charAt(Math.floor(Math.random() * baseLibrary.length));
    }
    if(dnaTextarea) {
        dnaTextarea.value = chainOutput;
        runGeneticPipeline();
    }
}

// Sequence  Formatter 
function renderVisualSequenceBlocks(sequence) {
    return sequence.split("").map(base => {
        const colorHex = BASE_COLORS[base] || "#888";
        return `<span style="background:${colorHex}22; color:${colorHex}; border:1px solid ${colorHex}66; border-radius:6px; padding:4px 8px; margin:2px; font-family:monospace; font-size:1.1rem; font-weight:700; display:inline-block;">${base}</span>`;
    }).join("");
}

// Main UI 
function runGeneticPipeline() {
    if (!dnaTextarea || !resultsPanel) return;
    
    const inputString = dnaTextarea.value;
    const cleanDNAChain = stripIllegalBases(inputString);

    const sequenceLength = cleanDNAChain.length;
    const gcPercentage = calculateGCPercentage(cleanDNAChain).toFixed(1);
    const totalCodonsCount = Math.floor(sequenceLength / 3);
    
    const countA = (cleanDNAChain.match(/A/g) || []).length;
    const countT = (cleanDNAChain.match(/T/g) || []).length;
    const countG = (cleanDNAChain.match(/G/g) || []).length;
    const countC = (cleanDNAChain.match(/C/g) || []).length;

    document.getElementById("metric-length").innerText = `${sequenceLength} bp`;
    document.getElementById("metric-gc").innerText = `${gcPercentage}%`;
    document.getElementById("metric-codons").innerText = totalCodonsCount;
    document.getElementById("metric-counts").innerText = `${countA}/${countT}/${countG}/${countC}`;

    if (!cleanDNAChain.length) {
        resultsPanel.innerHTML = `<div class="info-banner">Enter a DNA sequence on the left to begin.</div>`;
        return;
    }

    const mrnaResult = executeTranscription(cleanDNAChain);
    const translatedAminos = executeTranslation(mrnaResult);

    let panelStructureHtml = `
        <h3>Template DNA (3' → 5')</h3>
        <div class="sequence-container">${renderVisualSequenceBlocks(cleanDNAChain)}</div>
        <code>${cleanDNAChain}</code>

        <div class="arrow-divider"> Transcription</div>

        <h3>Messenger RNA (5' → 3')</h3>
        <div class="sequence-container">${renderVisualSequenceBlocks(mrnaResult)}</div>
        <code>${mrnaResult}</code>

        <div class="arrow-divider"> Translation</div>

        <h3>Polypeptide Chain</h3>
    `;
    if (mrnaResult.length >= 3) {
        let innerTableRowsHtml = "";
        let indexCounter = 0;
        let stopCodonFound = false;
                for (let i = 0; i < mrnaResult.length - 2; i += 3) {
    const activeCodon = mrnaResult.substring(i, i + 3);
    const singleAmino = translatedAminos[indexCounter] || "?";
    const descriptiveName = AMINO_ACID_FULL_NAMES[singleAmino] || singleAmino;
    
    let rowStyle = "";
    if (singleAmino == ("Stop"));{
    }
    if (stopCodonFound) {
         rowStyle = 'style="background-color: rgba(239, 68, 68, 0.08); color: #ef4444; opacity: 0.7; text-decoration: line-through;"';
    }
    // crossing out amino acids present after stop codon
     if (singleAmino === "Met") {
        rowStyle = 'style="background-color: rgba(35, 134, 54, 0.15); color: #4ade80;"';
    }
    else if (singleAmino === "Stop") {
        rowStyle = 'style="background-color: rgba(248, 113, 113, 0.15); color: #f87171;"';
        stopCodonFound = true;
    }
    innerTableRowsHtml += `
        <tr ${rowStyle}>
            <td style="font-family:monospace; font-weight:bold;">${activeCodon}</td>
            <td>${singleAmino}</td>
            <td>${descriptiveName}</td>
        </tr>
    `;
    indexCounter++;
}    
        panelStructureHtml += `
            <div class="table-wrapper" style="margin-bottom: 1.5rem;">
                <table>
                    <thead>
                        <tr><th>Codon</th><th>Amino Acid</th><th>Full Structural Name</th></tr>
                    </thead>
                    <tbody>${innerTableRowsHtml}</tbody>
                </table>
            </div>
            <code>${translatedAminos.includes("Stop")
                    ?translatedAminos.slice(0,translatedAminos.indexOf("Stop")+1).join('-')
                    :translatedAminos.join(" - ")}</code>
                    `;
     //cutting out translated amino acids found after stop
    } else {
        panelStructureHtml += `<div class="warning-banner">Need at least 3 bases to form a codon.</div>`;
    }

    resultsPanel.innerHTML = panelStructureHtml;
}

//  Codon reference table 
function initializeCodonDatabaseTable() {
    const dataTableBody = document.getElementById("codon-table-body");
    if (!dataTableBody) return;
    
    let generationBufferHtml = "";
    for (const [codonKey, aminoShortcut] of Object.entries(CODON_TABLE)) {
        const structuralFullName = AMINO_ACID_FULL_NAMES[aminoShortcut] || aminoShortcut;
        generationBufferHtml += `
            <tr data-codon="${codonKey}" data-shortcut="${aminoShortcut.toUpperCase()}" data-fulltitle="${structuralFullName.toUpperCase()}">
                <td style="font-family:monospace; font-weight:bold;">${codonKey}</td>
                <td>${aminoShortcut}</td>
                <td>${structuralFullName}</td>
            </tr>
        `;
    }
    dataTableBody.innerHTML = generationBufferHtml;
}

function filterCodonTable() {
    const queryValue = document.getElementById("codon-search").value.toUpperCase();
    const rowsList = document.querySelectorAll("#codon-table-body tr");
    
    rowsList.forEach(tableRow => {
        const matchesCodonKey = tableRow.getAttribute("data-codon").includes(queryValue);
        const matchesShortcut = tableRow.getAttribute("data-shortcut").includes(queryValue);
        const matchesFullTitle = tableRow.getAttribute("data-fulltitle").includes(queryValue);
        
        if (matchesCodonKey || matchesShortcut || matchesFullTitle) {
            tableRow.style.display = "";
        } else {
            tableRow.style.display = "none";
        }
    });
}
// Global Simulation State Variables
let simInterval = null;
let simIsPlaying = false;
let simSpeed = 1000;
let simData = {
    phase: "TRANSCRIPTION",
    index: 0,
    dnaSequence: "",
    mrnaSequence: "",
    aminoAcids: []
};

//Initialization
function startVisualSimulation() {
    // 1. Fetch current sequence from your textarea workspace
    if (!dnaTextarea) dnaTextarea = document.getElementById("dna-textarea");
    const rawInput = dnaTextarea ? dnaTextarea.value : "TACGGCATACTTATT"; 
    const cleanDNA = stripIllegalBases(rawInput);

    if (cleanDNA.length < 3) {
        alert("Please enter a longer valid DNA sequence (at least 3 bases) to simulate.");
        return;
    }


    simData.phase = "TRANSCRIPTION";
    simData.index = 0;
    simData.dnaSequence = cleanDNA;
    simData.mrnaSequence = "";
    simData.aminoAcids = [];

    const speedSlider = document.getElementById("sim-speed-slider");
    if (speedSlider) {
        // Reverse calculation so left is slow, right is fast
        simSpeed = 2500 - parseInt(speedSlider.value);
        speedSlider.oninput = function() {
            simSpeed = 2500 - parseInt(this.value);
            document.getElementById("speed-label").innerText = (1000 / simSpeed).toFixed(1) + "x";
            if (simIsPlaying) {
                // Instantly cycle interval loop to use updated speed tracking
                clearInterval(simInterval);
                simInterval = setInterval(stepVisualSimulation, simSpeed);
            }
        };
    }

    renderStaticDNATrack();
    document.getElementById("sim-output-row").innerHTML = "";
    document.getElementById("sim-polypeptide-chain").innerHTML = '<div class="empty-placeholder">Waiting for Translation...</div>';
    
    const enzyme = document.getElementById("visual-enzyme");
    enzyme.className = "enzyme-pill polymerase-mode";
    document.getElementById("enzyme-name").innerText = "RNA Polymerase";
    
    updateSimulationUIFeedback();
    
   
    document.getElementById("btn-sim-step").disabled = false;
    document.getElementById("btn-sim-reset").disabled = false;
}

function renderStaticDNATrack() {
    const track = document.getElementById("sim-dna-row");
    if (!track) return;
    track.innerHTML = simData.dnaSequence.split("").map((base, idx) => {
        const color = BASE_COLORS[base] || "#f3eded";
        return `<span id="sb-dna-${idx}" class="pop-node" style="background:${color}22; color:${color}; border:1px solid ${color}66; border-radius:6px; padding:4px 8px; font-family:monospace; font-weight:700; width:14px; text-align:center; display:inline-block;">${base}</span>`;
    }).join("");
}

function stepVisualSimulation() {
    if (simData.phase === "TRANSCRIPTION") {
        runTranscriptionLoopStep();
    } else if (simData.phase === "TRANSLATION") {
        runTranslationLoopStep();
    } else {
        haltSimulationPlayback();
    }
}

function runTranscriptionLoopStep() {
    const i = simData.index;
    if (i < simData.dnaSequence.length) {
        const dnaBase = simData.dnaSequence[i];
        const complementRules = {"A": "U", "T": "A", "G": "C", "C": "G"};
        const rnaBase = complementRules[dnaBase] || "?";
        
        simData.mrnaSequence += rnaBase;

        // Accent active item on the DNA tracking line row block container
        const currentDNANode = document.getElementById(`sb-dna-${i}`);
        if (currentDNANode) {
            currentDNANode.style.background = BASE_COLORS[dnaBase];
            currentDNANode.style.color = "#000";
        }

        // Draw fresh matched mRNA node block dynamically downstream
        const rnaColor = BASE_COLORS[rnaBase];
        const mrnaOutput = document.getElementById("sim-output-row");
        mrnaOutput.innerHTML += `<span id="sb-mrna-${i}" class="pop-node" style="background:${rnaColor}; color:#000; border-radius:6px; padding:4px 8px; font-family:monospace; font-weight:700; width:14px; text-align:center; display:inline-block;">${rnaBase}</span>`;

        simData.index++;
        animateEnzymePositionShift(simData.index, 38); // Base nodes shift offset multiplier constant
    }

    // Evaluate Phase limits constraints
    if (simData.index >= simData.dnaSequence.length) {
        simData.phase = "TRANSLATION";
        simData.index = 0;
        haltSimulationPlayback();
        showInLineBanner("Transcription completed successfully! Transforming active Enzyme component over to Ribosome Translation state.");
        
        // Transform visual structure profiles models definitions
        const enzyme = document.getElementById("visual-enzyme");
        enzyme.className = "enzyme-pill ribosome-mode";
        document.getElementById("enzyme-name").innerText = "Ribosome";
        
        // Relocate tracking elements target maps coordinates
        animateEnzymePositionShift(0, 38);
    }
    updateSimulationUIFeedback();
}

function runTranslationLoopStep() {
    const i = simData.index;
    if (i < simData.mrnaSequence.length - 2) {
        const triplet = simData.mrnaSequence.substring(i, i + 3);
        const aminoSign = CODON_TABLE[triplet] || "?";
        
        simData.aminoAcids.push(aminoSign);

        // Turn all 3 elements of active functional group bright neon green visually
        for (let b = 0; b < 3; b++) {
            const block = document.getElementById(`sb-mrna-${i + b}`);
            if (block) {
                block.style.background = "#BCF96C";
                block.style.borderColor = "#BCF96C";
                block.style.color = "#000";
                block.style.shadow = "0 0 12px #BCF96C";
            }
        }

        // Generate the horizontal peptide chain node arrays elements
        const chainWrapper = document.getElementById("sim-polypeptide-chain");
        if (i === 0) chainWrapper.innerHTML = ""; // Wipe empty text wrapper placeholder block

        let nodeColorStyle = "background: #2563eb; color: #fff; border: 1px solid #3b82f6;";
        
        // Evaluate specialized state overrides boundaries colors blocks rules definitions
        if (aminoSign === "Met") nodeColorStyle = "background: rgba(35,134,54,0.2); color:#BCF96C; border:1px solid #4ade80;";
        if (aminoSign === "Stop") nodeColorStyle = "background: rgba(248,113,113,0.2); color:#f87171; border:1px solid #f87171;";

        // Check if Stop flag has triggered in background sequences arrays
        const isPastStop = simData.aminoAcids.includes("Stop") && aminoSign !== "Stop";
        if (isPastStop) {
            nodeColorStyle = "background: rgba(239,68,68,0.05); color:#ef4444; border:1px dashed #ef4444; opacity:0.4; text-decoration:line-through;";
        }

        chainWrapper.innerHTML += `<div class="pop-node" style="${nodeColorStyle} padding: 6px 14px; border-radius: 20px; font-weight:bold; font-size:0.85rem; display:inline-block;">${aminoSign}</div>`;
        
        if (i + 3 < simData.mrnaSequence.length - 2) {
            chainWrapper.innerHTML += `<span style="color: rgba(255,255,255,0.2); font-weight:bold; padding: 0 4px;">--</span>`;
        }

        simData.index += 3;
        animateEnzymePositionShift(simData.index, 38);

        if (aminoSign === "Stop") {
            simData.phase = "FINISHED";
            haltSimulationPlayback();
            showInLineBanner("Stop codon encountered! Translation terminates. Polypeptide chain released.");
        }
    }

    if (simData.index >= simData.mrnaSequence.length - 2 && simData.phase !== "FINISHED") {
        simData.phase = "FINISHED";
        haltSimulationPlayback();
    }
    updateSimulationUIFeedback();
}

// Helper block computing positional offsets transformations values metrics properties
function animateEnzymePositionShift(indexPosition, pixelWidthConstant) {
    const enzyme = document.getElementById("visual-enzyme");
    if (!enzyme) return;
    
    // Calculates horizontal alignment margin adjustments matching text blocks offsets
    const leftMarginAnchorOffset = 70; 
    const computedPosition = leftMarginAnchorOffset + (indexPosition * pixelWidthConstant);
    enzyme.style.left = `${computedPosition}px`;
}

// Toggles automatic interval polling playback loops engines configurations properties
function toggleSimAutoPlay() {
    const playBtn = document.getElementById("btn-sim-play");
    
    if (simData.phase === "FINISHED") {
        startVisualSimulation(); // Auto-restart if clicked while complete
    }

    if (!simIsPlaying) {
        // Edge check: Initialize from absolute scratch if simulation context was completely idle
        if (simData.phase === "TRANSCRIPTION" && simData.index === 0 && document.getElementById("sim-dna-row").children.length === 0) {
            startVisualSimulation();
        }
        
        simIsPlaying = true;
        playBtn.innerText = "⏸ Pause";
        playBtn.style.background = "#9a3412"; // Switch colors status highlights tracking values
        simInterval = setInterval(stepVisualSimulation, simSpeed);
    } else {
        haltSimulationPlayback();
    }
}

function haltSimulationPlayback() {
    simIsPlaying = false;
    clearInterval(simInterval);
}
function showInLineBanner( message , type = "info"){
    const banner = document.getElementById("sim-in-line-banner")
    if (!banner) return;
    banner.classname=`sim-banner${type}`;
    banner.innertext = message;
    if (type ==="info"){
        set timeOut(()=>{ banner.classList.add("banner-hidden");
                     },4000);
    }
}
function updateSimulationUIFeedback() {
    const label = document.getElementById("sim-status-text");
    if (!label) return;

    let activePhase = "TRANSCRIPTION";
    let activeIndex = 0;

    if (typeof simTimeline !== "undefined" && simTimeline[currentFrameIndex]) {
        activePhase = simTimeline[currentFrameIndex].phase;
        activeIndex = simTimeline[currentFrameIndex].pointerIndex;
    } else if (typeof simData !== "undefined") {
        activePhase = simData.phase;
        activeIndex = simData.index;
    }
    if (activePhase === "TRANSCRIPTION") {
        label.innerText = `[ Transcription: Base ${activeIndex} ]`;
        label.style.color = "#fbbf24";
    } else if (activePhase === "TRANSLATION") {
        label.innerText = `[ Translation: Codon Index ${activeIndex} ]`;
        label.style.color = "#4ade80";
    } else if (activePhase === "FINISHED") {
        label.innerText = "[ Simulation Complete ]";
        label.style.color = "#a855f7";
    }
}
        
        
                      
                      
    
