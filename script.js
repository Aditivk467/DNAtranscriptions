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

// Navigation Engine Switcher 
function switchPage(targetPageId) {
    document.querySelectorAll('.page').forEach(element => {
        element.classList.remove('active');
    });
    document.querySelectorAll('.nav-option').forEach(element => {
        element.classList.remove('active');
    });
    
    document.getElementById(`page-${targetPageId}`).classList.add('active');
    document.getElementById(`btn-${targetPageId}`).classList.add('active');
}

//  Data Processing Math Engines 
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
        
        for (let i = 0; i < mrnaResult.length - 2; i += 3) {
            const activeCodon = mrnaResult.substring(i, i + 3);
            const singleAmino = translatedAminos[indexCounter] || "?";
            const descriptiveName = AMINO_ACID_FULL_NAMES[singleAmino] || singleAmino;
            
            innerTableRowsHtml += `
                <tr>
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
            <code>${translatedAminos.join(" - ")}</code>
        `;
    } else {
        panelStructureHtml += `<div class="warning-banner">Need at least 3 bases to form a codon.</div>`;
    }

    resultsPanel.innerHTML = panelStructureHtml;
}

//  Codon Matrix table 
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
