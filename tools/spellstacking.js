// This returns the spell multiplier after casting (stacks) number of
// Weakness to magicka, reflected on (bodies) number of targets
// This function returns the multiplier on the magnitude of spells cast,
// which is 1 + WM/100, where WM the current Weakness to Magicka value
// on the player
function S1_S2_WM_spell_multiplier(stacks, bodies) {
    let weak_stack = [0,0];

    for (let i = 0; i < stacks; i++) {
	weak_stack[i%2] = bodies * (1 + weak_stack[0] + weak_stack[1]);
    }
    return 1 + weak_stack[0] + weak_stack[1];
}


function S1_H_S2_H_WM_spell_multiplier(stacks, bodies) {
    let weak_stack = [0,0,0];

    for (let i = 0; i < stacks; i++) {
	if (i%2 == 1) {
	    weak_stack[1] = bodies * (1 + weak_stack[0] + weak_stack[1] + weak_stack[2]);
	}
	else if (i%4==0){
	    weak_stack[0] = bodies * (1 + weak_stack[0] + weak_stack[1] + weak_stack[2]);
	}
	else {
	    weak_stack[2] = bodies * (1 + weak_stack[0] + weak_stack[1] + weak_stack[2]);
	}
	
    }
    return 1 + weak_stack[0] + weak_stack[1];
}


async function init(){
    document.getElementById("s1_s2").addEventListener('change',update);
    document.getElementById("s1_h_s2_h").addEventListener('change',update);
    document.getElementById("spellstackcasts").addEventListener('change',update);
    document.getElementById("bodies").addEventListener('change',update);
    document.getElementById("cycles").addEventListener('change',update);
}

function update() {
    let bodies =  document.getElementById("bodies").value ?? 0;
    let casts =  document.getElementById("spellstackcasts").value ?? 0;

    if (document.getElementById("cycles").checked) {
	document.getElementById("stack_label").textContent = "Number of cast cycles:";
	if (document.getElementById("s1_s2").checked) {
	    casts = casts * 2;
	}
	else {
	    casts = casts * 4;
	}
    }
    else {
	document.getElementById("stack_label").textContent = "Number of individual casts:";
    }

    if (document.getElementById("s1_s2").checked) {
	let mult = S1_S2_WM_spell_multiplier(casts, bodies);
	document.getElementById("stack_mult_output").textContent = mult;
	document.getElementById("stack_aoe_output").textContent = bodies*mult;
	
    }
    else {
	let mult = S1_H_S2_H_WM_spell_multiplier(casts, bodies);
	document.getElementById("stack_mult_output").textContent = mult;
	document.getElementById("stack_aoe_output").textContent = bodies*mult;
    }
}
