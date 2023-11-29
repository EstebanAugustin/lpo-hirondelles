// Déclarer les letiables à une portée globale
let objetSelector = document.getElementById('objetSelector');
// Ajouter un gestionnaire d'événements pour mettre à jour le deuxième graphique lors de la sélection de l'ID
objetSelector.addEventListener('change', updateSecondChart);
let ctx1 = document.getElementById('myFirstChart').getContext('2d');
let ctx2 = document.getElementById('mySecondChart').getContext('2d');
let parAnneeData = {};
let parIdEtAnneeData = {};  // Assurez-vous que cette ligne est ajoutée ici
let myFirstChart;
let mySecondChart;
let selectedId = objetSelector.value;
console.log(selectedId)

// Déclarer updateSecondChart en dehors de la fonction complete
function createChart(ctx, labels, data, datasetLabel) {
    // Créer le deuxième graphique avec les données agrégées
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateSecondChart() {
    selectedId = objetSelector.value;

    // Récupérer les données agrégées pour l'ID sélectionné
    let dataForSelectedId = parIdEtAnneeData[selectedId];

    // Convertir les données agrégées en tableaux pour les labels et les données du graphique 2
    let labelsChart2 = Object.keys(dataForSelectedId);
    let dataChart2 = labelsChart2.map(function(annee) {
        return dataForSelectedId[annee];
    });

    if (mySecondChart) {
        mySecondChart.destroy();
    }

    mySecondChart = createChart(ctx2, labelsChart2, dataChart2, 'Nombre de nichées par année pour le nid ' + selectedId);
}

// Charger le fichier CSV
Papa.parse("observations.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: "greedy",
    complete: function(results) {
        // Les données CSV sont stockées dans results.data
        let csvData = results.data;
        console.log(csvData)

        let anneesObservees = [...new Set(csvData.map(row => row.ANNEE))];
        console.log(anneesObservees)

        // Vérifier que les colonnes nécessaires existent
        if (csvData.length > 0 && 'ANNEE' in csvData[0] && 'NB_NICHEES' in csvData[0]) {
            // Remplir les tableaux avec les données du CSV
            csvData.forEach(function(row) {
                let id = row.ID
                let annee = row.ANNEE;
                let nb_nichees = row.NB_NICHEES;

                if (!parAnneeData[annee]) {
                    parAnneeData[annee] = {
                        "NB_NICHEES": 0
                    };
                }

                if (!parIdEtAnneeData[id]) {
                    parIdEtAnneeData[id] = {};
                    // Initialiser les années observées avec des valeurs à 0
                    anneesObservees.forEach(function(anneeObservee) {
                        parIdEtAnneeData[id][anneeObservee] = 0;
                    });
                }

                // Mettre à jour le nombre de nichées
                parAnneeData[annee].NB_NICHEES += nb_nichees;
                parIdEtAnneeData[id][annee] += nb_nichees;

            });
            // Remplir la liste déroulante avec les ID uniques
            let uniqueIds = [...new Set(csvData.map(row => row.ID))].sort();
            uniqueIds.forEach(function(id) {
                let option = document.createElement('option');
                option.value = id;
                option.textContent = id;
                objetSelector.appendChild(option);
            });

            // Convertir les données agrégées en tableaux pour les labels et les données du graphique
            let labelsChart1 = Object.keys(parAnneeData);
            let dataChart1 = labelsChart1.map(function(annee) {
                return parAnneeData[annee].NB_NICHEES;
            });

            let selectedId = objetSelector.value;

            // Récupérer les données agrégées pour l'ID sélectionné
            let dataForSelectedId = parIdEtAnneeData[selectedId];

            // Convertir les données agrégées en tableaux pour les labels et les données du graphique
            let labelsChart2 = Object.keys(dataForSelectedId);
            let dataChart2 = labelsChart2.map(function (annee) {
                return dataForSelectedId[annee];
            });

            myFirstChart = createChart(ctx1, labelsChart1, dataChart1, 'Nombre de nichées par année');
            mySecondChart = createChart(ctx2, labelsChart2, dataChart2, 'Nombre de nichées par année pour le nid ' + selectedId);
        } else {
            console.error("Les colonnes ANNEE et NB_NICHEES ne sont pas présentes dans le fichier CSV.");
        }
    }
});
