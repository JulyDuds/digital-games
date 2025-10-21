// Atualizar o ano automaticamente no rodapé
document.addEventListener('DOMContentLoaded', () => {
    const yearElements = document.querySelectorAll('#current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
});

