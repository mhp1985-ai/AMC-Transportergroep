const form = document.getElementById("ritForm");
const melding = document.getElementById("melding");

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const gegevens = {
    naam: form.naam.value,
    bedrijf: form.bedrijf.value,
    vertrek: form.vertrek.value,
    bestemming: form.bestemming.value,
    datum: form.datum.value,
    tijd: form.tijd.value,
    aantal: form.aantal.value,
    opmerking: form.opmerking.value
  };

  console.log("Ritaanvraag:", gegevens);

  melding.style.display = "block";
  melding.textContent =
    "De rit is ingevuld. Dit is een demo: de aanvraag wordt nog niet echt naar AMC verstuurd.";

  form.reset();
});
