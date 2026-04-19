function selectYear(yearValue) {
    const selectElement = document.getElementById("hg_jahrSelect");
    if (!selectElement) {
        console.warn("Select element not found.");
        return;
    }

    selectElement.value = yearValue;

    // Trigger change event
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));

}

function selectTeam(teamValue) {
    const selectElement = document.getElementById("hg_teamSelect");
    if (!selectElement) {
        console.warn("Element 'hg_teamSelect' not found.");
        return;
    }

    const optionExists = Array.from(selectElement.options).some(opt => opt.value === teamValue);
    if (!optionExists) {
        console.warn(`Team ${teamValue} not found in 'hg_teamSelect'.`);
        return;
    }

    selectElement.value = teamValue;
    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
}


function selectAlle(value) {
    const radioInputs = document.querySelectorAll('#hg_alle input[name="alle"]');
    let found = false;

    radioInputs.forEach(input => {
        if (input.value == value) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            found = true;
        }
    });

    if (!found) {
        console.warn(`Radio value '${value}' not found in 'hg_alle'.`);
    }
}
