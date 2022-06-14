const rebuildQuestsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('quest-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let fame = 0;

    for (const quest of window.oblivionSaveFile.SaveFile.constants.quests) {
        let status = '✖';
        let haveStages = [];
        let completedStatus = false;
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === quest.formId);
            if (record) {
                record.subRecord.stage.filter((stage) => stage.flag & 0x1).forEach((stage) => {
                    haveStages.push({index: stage.index, completion: quest.stages.includes(stage.index)});
                });
                for (const stage of record.subRecord.stage) {
                    if (quest.stages.includes(stage.index) && stage.flag&0x1) {
                        status = '✔';
                        ++completed;
                        fame += quest.fame;
                        completedStatus = true;
                        break;
                    }
                }
            }
        }
        for (const stage of quest.stages) {
            if (haveStages.find((s2) => s2.index === stage) === undefined)
                haveStages.push({index: stage});
        }

        haveStages = haveStages.sort((l, r) => l.index - r.index);

        let stagesStr = '';

        for (const stage of haveStages) {
            if (stage.completion)
                stagesStr += `<strong style='color:green'>${stage.index}</strong><br>`;
            else if (stage.completion === undefined)
                stagesStr += `<strong style='color:${completedStatus ? 'yellow' : 'red'}'>${stage.index}</strong><br>`;
            else
                stagesStr += `${stage.index}<br>`;
        }

        let qTr = document.createElement('tr');
        if (completedStatus === true && haveStages.length <= 1)
            qTr.style.backgroundColor = 'lightyellow';

        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='id'>${quest.id}</td>
<td class='formId'>${('0000000'+quest.formId.toString(16)).substr(-8)}</td>
<td class='name'>${quest.name}</td>
<td class='stages'>${stagesStr}</td>
<td class='fame'>${quest.fame}</td>
<td class='url'><a href="${quest.url}">UESP</a></td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
    qFoot.querySelector('.total-fame').innerText = fame;
};

const rebuildIncompleteQuestsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('incomplete-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let fame = 0;

    for (const quest of window.oblivionSaveFile.SaveFile.constants.incompleteQuests) {
        let status = '✖';
        if (saveFile) {
            
            let record = saveFile.records.find((e) => e.formId === quest.formId);
            if (record) {
                for (const stage of record.subRecord.stage) {
                    if (quest.stages.includes(stage.index) && stage.flag & 0x1 === 0x1) {
                        status = '✔';
                        break;
                    }
                }
                for (const stage of record.subRecord.stage) {
                    if (quest.failStages.includes(stage.index) && stage.flag & 0x1 === 0x1) {
                        status = '❗';
                        break;
                    }
                }
                if (status === '✔') ++completed;
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='id'>${quest.id}</td>
<td class='formId'>${('0000000'+quest.formId.toString(16)).substr(-8)}</td>
<td class='name'>${quest.name}</td>
<td class='stages'>${quest.stages.join('<br>')}</td>
<td class='failStages'>${quest.failStages.join('<br>')}</td>
<td class='url'><a href="${quest.url}">UESP</a></td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildLocsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('loc-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const loc of window.oblivionSaveFile.SaveFile.constants.locs) {
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === loc.formId);
            if (record) {
                let prop = record.subRecord.properties.find(p=>p.flag===51);
                if (prop && prop.value===3) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${loc.formId?('0000000'+loc.formId.toString(16)).substr(-8):'???'}</td>
<td class='name'>${loc.name}</td>
<td class='x'>${loc.x??loc.approxX}</td>
<td class='y'>${loc.y??loc.approxY}</td>
<td class='z'>${loc.z??'?'}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};
const rebuildSkillsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('skills-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let record = undefined;
    if (saveFile) {
        record = saveFile.records.find((e) => e.formId===0x7);
    }

    for (const skill of window.oblivionSaveFile.SaveFile.constants.skills) {
        let status = '✖';

        let skillLevel = 0;

        if (record) {
            skillLevel = record.subRecord[skill.key];
            if (skillLevel >= 100) {
                status = '✔';
                ++completed;
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='name'>${skill.name}</td>
<td class='level'>${skillLevel}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};
const rebuildGatesTable = (saveFile = undefined) => {
    let qTable = document.getElementById('gates-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const gate of window.oblivionSaveFile.SaveFile.constants.gates) {
        if (gate.ignore) continue;

        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === gate.formId);
            if (record) {
                if (record.flags & 0x7000005 === 0x7000005) {
                    if (record.subRecord && record.subRecord.flags !== undefined && (record.subRecord.flags & 0x2000) === 0x2000) {
                        status = '✔';
                        ++completed;
                    }
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${gate.formId?('0000000'+gate.formId.toString(16)).substr(-8):'???'}</td>
<td class='name'>${gate.name}</td>
<td class='x'>${gate.x}</td>
<td class='y'>${gate.y}</td>
<td class='z'>${gate.z}</td>
<td class='fixed'>${gate.fixed ? 'Yes' : 'No'}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildHorsesTable = (saveFile = undefined) => {
    let qTable = document.getElementById('horses-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const horse of window.oblivionSaveFile.SaveFile.constants.horses) {
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === horse.formId);
            if (record) {
                if (record.flags & 0x40000000) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${horse.formId?('0000000'+horse.formId.toString(16)).substr(-8):'???'}</td>
<td class='name'>${horse.name}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildInvestmentsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('investments-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const invest of window.oblivionSaveFile.SaveFile.constants.investments) {
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === invest.formId);
            if (record) {
                if (record.subRecord?.properties.find(p=>p.flag===82)?.value === 500) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${invest.formId?('0000000'+invest.formId.toString(16)).substr(-8):'???'}</td>
<td class='city'>${invest.city}</td>
<td class='store'>${invest.store}</td>
<td class='name'>${invest.name}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildBooksTable = (saveFile = undefined) => {
    let qTable = document.getElementById('books-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const book of window.oblivionSaveFile.SaveFile.constants.books) {
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === book.formId);
            if (record) {
                if (record.subRecord?.teaches === 255) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${book.formId?('0000000'+book.formId.toString(16)).substr(-8):'???'}</td>
<td class='skill'>${book.skill}</td>
<td class='name'>${book.name}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildInfo = (saveFile) => {
    const infoDiv = document.querySelector('#info-table .info');
    for (const elem of [...infoDiv.querySelectorAll('.read')]) {
        const key = [...elem.classList].filter(c=>c!=='read')[0];
        const valDiv = elem.querySelector('.value');
        let val = saveFile[key];
        if (val instanceof Date) {
            val = val.toISOString();
        }
        valDiv.innerText = val;
    }
    [...infoDiv.querySelectorAll('.screenshot > *')].forEach(e=>e.remove());
    let canvas = document.createElement('canvas');
    infoDiv.querySelector('.screenshot').append(canvas);
    canvas.width = saveFile.screenshotWidth;
    canvas.height = saveFile.screenshotHeight;
    let ctx = canvas.getContext('2d');
    let data = ctx.getImageData(0,0,canvas.width,canvas.height);
    let ssOffset = 0;
    let cOffset = 0;
    for (; ssOffset < saveFile.screenshotSize; ++ssOffset, ++cOffset) {
        data.data[cOffset] = saveFile.screenshotData[ssOffset];
        if (ssOffset % 3 === 2) {
            ++cOffset;
            data.data[cOffset] = 255;
        }
    }
    ctx.putImageData(data, 0, 0);
};

const rebuildHousesTable = (saveFile = undefined) => {
    let qTable = document.getElementById('houses-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const house of window.oblivionSaveFile.SaveFile.constants.houses) {
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === house.formId);
            if (record) {
                if (record.subRecord?.stageNum > 0) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${house.formId?('0000000'+house.formId.toString(16)).substr(-8):'???'}</td>
<td class='city'>${house.city}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildArtifactsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('artifacts-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let fame = 0;

    for (const artifact of window.oblivionSaveFile.SaveFile.constants.artifacts) {
        let quest = window.oblivionSaveFile.SaveFile.constants.quests.find(q=>q.id === artifact.id);
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === quest.formId);
            if (record) {
                for (const stage of record.subRecord.stage) {
                    if (stage.index === 100 && stage.flag&0x1) {
                        status = '✔';
                        ++completed;
                    }
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${('0000000'+quest.formId.toString(16)).substr(-8)}</td>
<td class='name'>${artifact.name}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildNirnrootTable = (saveFile = undefined) => {
    let qTable = document.getElementById('nirnroot-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const root of window.oblivionSaveFile.SaveFile.constants.nirnroots) {
        let status = '✖';
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === root.formId);
            if (record) {
                if (record.flags&0x44000000===0x44000000) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${root.formId?('0000000'+root.formId.toString(16)).substr(-8):'???'}</td>
<td class='x'>${root.x}</td>
<td class='y'>${root.y}</td>
<td class='z'>${root.z}</td>
<td class='cell'>${root.cell}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildArenaTable = (saveFile = undefined) => {
    let qTable = document.getElementById('arena-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let fame = 0;

    for (const fight of window.oblivionSaveFile.SaveFile.constants.arena) {
        let status = '✖';
        if (saveFile) {
            
            let record = saveFile.records.find((e) => e.formId === fight.formId);
            if (record) {
                if (record.subRecord?.topicSaidOnce) {
                    status = '✔';
                    ++completed;
                    fame += fight.fame;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${('0000000'+fight.formId.toString(16)).substr(-8)}</td>
<td class='name'>${fight.name}</td>
<td class='fame'>${fight.fame}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
    qFoot.querySelector('.total-fame').innerText = fame;
};

const rebuildPowersTable = (saveFile = undefined) => {
    let qTable = document.getElementById('powers-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let record = undefined;
    if (saveFile) {
        record = saveFile.records.find((e) => e.formId===0x7);
    }

    for (const power of window.oblivionSaveFile.SaveFile.constants.greaterPowers) {
        let status = '✖';

        if (record) {
            if (record.subRecord.spellIds.map(i=>saveFile.formIds[i]??i).includes(power.formId)) {
                status = '✔';
                ++completed;
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${('0000000'+power.formId.toString(16)).substr(-8)}</td>
<td class='name'>${power.name}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildWayshrinesTable = (saveFile = undefined) => {
    let qTable = document.getElementById('wayshrines-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;

    for (const shrine of window.oblivionSaveFile.SaveFile.constants.wayshrines) {
        let status = '✖';

        let fameLevel = 0;

        if (saveFile) {
            fameLevel = saveFile.globals[shrine.globalIndex]?.value;
            if (fameLevel > 0) {
                status = '✔';
                ++completed;
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='name'>${shrine.name}</td>
<td class='fameLevel'>${fameLevel}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildFameTable = (saveFile = undefined) => {
    let qTable = document.getElementById('fame-table');
    let qBody = qTable.querySelector('tbody');
    let qQuestsRow = qBody.querySelector('tr.quests');
    let qGatesRow = qBody.querySelector('tr.gates');
    let qArenaRow = qBody.querySelector('tr.arena');
    let qTotalRow = qBody.querySelector('tr.total');

    let totalCurrent = 0;
    let totalMax = 0;

    // Quests
    let questsCurrent = 0;
    let questsMax = 0;
    for (const quest of window.oblivionSaveFile.SaveFile.constants.quests) {
        questsMax += quest.fame;
        totalMax += quest.fame;
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === quest.formId);
            if (record) {
                for (const stage of record.subRecord.stage) {
                    if (quest.stages.includes(stage.index) && stage.flag&0x1) {
                        questsCurrent += quest.fame;
                        totalCurrent += quest.fame;
                        break;
                    }
                }
            }
        }
    }

    let questsStatus = questsCurrent === questsMax ? '✔' : '✖';
    qQuestsRow.querySelector('.status').innerText = questsStatus;
    qQuestsRow.querySelector('.current').innerText = questsCurrent;
    qQuestsRow.querySelector('.max').innerText = questsMax;

    // Gates
    let gatesCurrent = 0;
    // +40 for random gates
    let gatesMax = 40;
    totalMax += 40;
    for (const gate of window.oblivionSaveFile.SaveFile.constants.gates) {
        if (gate.fixed) {
            gatesMax += gate.fame;
            totalMax += gate.fame;
        }
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === gate.formId);
            if (record) {
                if (record.flags & 0x7000005 === 0x7000005) {
                    if (record.subRecord && record.subRecord.flags !== undefined && (record.subRecord.flags & 0x2000) === 0x2000) {
                        gatesCurrent += gate.fame;
                        totalCurrent += gate.fame;
                    }
                }
            }
        }
    }

    let gatesStatus = gatesCurrent === gatesMax ? '✔' : '✖';
    qGatesRow.querySelector('.status').innerText = gatesStatus;
    qGatesRow.querySelector('.current').innerText = gatesCurrent;
    qGatesRow.querySelector('.max').innerText = gatesMax;

    // Arena
    let arenaCurrent = 0;
    // +10 for champion fight
    let arenaMax = 10;
    totalMax += 10;

    for (const fight of window.oblivionSaveFile.SaveFile.constants.arena) {
        if (!fight.ignore) {
            arenaMax += fight.fame;
            totalMax += fight.fame;
        }
        if (saveFile) {
            let record = saveFile.records.find((e) => e.formId === fight.formId);
            if (record) {
                if (record.subRecord?.topicSaidOnce) {
                    arenaCurrent += fight.fame;
                    totalCurrent += fight.fame;
                }
            }
        }
    }

    let arenaStatus = arenaCurrent === arenaMax ? '✔' : '✖';
    qArenaRow.querySelector('.status').innerText = arenaStatus;
    qArenaRow.querySelector('.current').innerText = arenaCurrent;
    qArenaRow.querySelector('.max').innerText = arenaMax;

    // Totals
    let totalStatus = totalCurrent === totalMax ? '✔' : '✖';
    qTotalRow.querySelector('.status').innerText = totalStatus;
    qTotalRow.querySelector('.current').innerText = totalCurrent;
    qTotalRow.querySelector('.max').innerText = totalMax;
};

const rebuildFactionsTable = (saveFile = undefined) => {
    let qTable = document.getElementById('factions-table');
    let qBody = qTable.querySelector('tbody');
    let qFoot = qTable.querySelector('tfoot');

    [...qBody.querySelectorAll('tr')].forEach((e) => {
        e.remove();
    });

    let completed = 0;
    let record = undefined;
    if (saveFile) {
        record = saveFile.records.find((e) => e.formId===0x7);
    }

    for (const faction of window.oblivionSaveFile.SaveFile.constants.factions) {
        if (faction.ignore) continue;
        let status = '✖';
        let rank = 0;
        if (saveFile) {
            if (record) {
                rank = record.subRecord?.factions?.find(f=>saveFile.formIds[f.faction]===faction.formId)?.factionRank;
                if (rank === faction.maxRank) {
                    status = '✔';
                    ++completed;
                }
            }
        }

        let qTr = document.createElement('tr');
        qTr.innerHTML = `
<td class='status ${status}'>${status}</td>
<td class='formId'>${faction.formId?('0000000'+faction.formId.toString(16)).substr(-8):'???'}</td>
<td class='name'>${faction.name}</td>
<td class='maxRankName'>${faction.maxRankName}</td>
<td class='curRank'>${rank}</td>
<td class='maxRank'>${faction.maxRank}</td>
`;
        qBody.append(qTr);
    }

    qFoot.querySelector('.total-completed').innerText = completed;
};

const rebuildStatistics = (saveFile) => {
    const record = saveFile.records.find(r=>r.formId===0x14);
    if (record) {
        const statDiv = document.querySelector('#statistics-table');
        for (const elem of [...statDiv.querySelectorAll('.read')]) {
            const key = [...elem.classList].filter(c=>c!=='read')[0];
            const valDiv = elem.querySelector('.value');
            let val = record.subRecord?.player?.statistics[key];
            if (val === undefined) {
                val = '?';
            }
            if (val instanceof Date) {
                val = val.toISOString();
            }
            valDiv.innerText = val;
        }
    }
};

const readSaveFile = (ts, saveFile) => {
    // Reapply prototype since it may be lost over ws
    saveFile.records.forEach(r=>{
        Object.setPrototypeOf(r, window.oblivionRecord.default.prototype);
    });
    window.saveFile = saveFile;
    rebuildQuestsTable(saveFile);
    let ts2 = Date.now();
    console.log(`rebuildQuestsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildLocsTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildLocsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildSkillsTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildSkillsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildGatesTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildGatesTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildHorsesTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildHorsesTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildInvestmentsTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildInvestmentsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildBooksTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildBooksTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildHousesTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildHousesTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildArtifactsTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildArtifactsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildNirnrootTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildNirnrootTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildArenaTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildArenaTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildFameTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildFameTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildFactionsTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildFactionsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildPowersTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildPowersTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildWayshrinesTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildWayshrinesTable done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildIncompleteQuestsTable(saveFile);
    ts2 = Date.now();
    console.log(`rebuildIncompleteQuestsTable done, elapsed ${ts2 - ts}`);
    ts = ts2;

    rebuildInfo(saveFile);
    ts2 = Date.now();
    console.log(`rebuildInfo done, elapsed ${ts2 - ts}`);
    ts = ts2;
    rebuildStatistics(saveFile);
    ts2 = Date.now();
    console.log(`rebuildStatistics done, elapsed ${ts2 - ts}`);
    ts = ts2;
};

document.addEventListener('DOMContentLoaded', () => {
    rebuildQuestsTable();
    rebuildLocsTable();
    rebuildSkillsTable();
    rebuildGatesTable();
    rebuildHorsesTable();
    rebuildInvestmentsTable();
    rebuildBooksTable();
    rebuildHousesTable();
    rebuildArtifactsTable();
    rebuildNirnrootTable();
    rebuildArenaTable();
    rebuildFameTable();
    rebuildFactionsTable();
    rebuildPowersTable();
    rebuildWayshrinesTable();
    rebuildIncompleteQuestsTable();

    const params = new URLSearchParams(window.location.search);
    const wsParam = params.get('WS');

    if (wsParam) {
        function heartbeat() {
            clearTimeout(this.pingTimeout);

            // Use `WebSocket#terminate()`, which immediately destroys the connection,
            // instead of `WebSocket#close()`, which waits for the close timer.
            // Delay should be equal to the interval at which your server
            // sends out pings plus a conservative assumption of the latency.
            this.pingTimeout = setTimeout(() => {
                this.terminate();
            }, 30000 + 1000);
        }

        const client = new WebSocket(wsParam);

        client.onmessage = (ev) => {
            let ts = Date.now();
            console.log(`Received WS message at ${ts}`);
            const msg = JSON.parse(ev.data);
            switch(msg.msg) {
                case 'saveFile':
                    readSaveFile(ts, msg.save);
                    break;
            }
        };
        client.onopen = () => {
            // @TODO: Handle timeout/reconnect
            let i = setInterval(()=>{
                client.send(JSON.stringify({
                    msg: 'ping'
                }));
            }, 20000);
            client.send(JSON.stringify({
                msg: 'latest'
            }));
        };

    } else {
        const ignoreEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        // Handle drag+drop of files. Have to ignore dragenter/dragover for compatibility reasons.
        document.body.addEventListener('dragenter', ignoreEvent);
        document.body.addEventListener('dragover', ignoreEvent);

        /**
         * @param {DragEvent} e 
         */
        const dropHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dt = e.dataTransfer;
            if (dt) {
                const files = dt.files;
                for (const file of files)
                void file.arrayBuffer().then((b) => {
                    let ts = Date.now();
                    console.log(`Starting save file parse at ${ts}`);
                    const saveFile = new window.oblivionSaveFile.SaveFile(b);
                    let ts2 = Date.now();
                    console.log(`Initial parse done, elapsed ${ts2 - ts}`);
                    ts = ts2;
                    console.log(saveFile);
                    readSaveFile(ts, saveFile);
                });
            }
        };

        document.body.addEventListener('drop', dropHandler);
    }
});
