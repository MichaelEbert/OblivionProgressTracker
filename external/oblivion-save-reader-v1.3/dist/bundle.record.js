!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.oblivionRecord=t():e.oblivionRecord=t()}(self,(function(){return(()=>{"use strict";var e={727:(e,t,a)=>{a.d(t,{Y:()=>r});class r{constructor(e,t){this.buffer=e,this.realOffset=t}get offset(){return this.realOffset}advance(e){this.realOffset+=e}clone(){return new r(this.buffer,this.offset)}readDate(e){null!=e||(e=this.buffer.byteLength);const t=new Uint16Array(this.buffer.slice(this.offset,this.realOffset+=16)),a=t[0],r=t[1],s=t[3],i=t[4],o=t[5],d=t[6],n=t[7];return new Date(a,r,s,i,o,d,n)}readInt(e){return null!=e||(e=this.buffer.byteLength),new Uint32Array(this.buffer.slice(this.offset,this.realOffset+=4))[0]}readShort(e){return null!=e||(e=this.buffer.byteLength),new Uint16Array(this.buffer.slice(this.offset,this.realOffset+=2))[0]}peekShort(e){return null!=e||(e=this.buffer.byteLength),new Uint16Array(this.buffer.slice(this.offset,this.realOffset+2))[0]}readByte(e){return null!=e||(e=this.buffer.byteLength),new Uint8Array(this.buffer.slice(this.offset,this.realOffset+=1))[0]}peekByte(e){return null!=e||(e=this.buffer.byteLength),new Uint8Array(this.buffer.slice(this.offset,this.realOffset+1))[0]}readFloat(e){return null!=e||(e=this.buffer.byteLength),new Float32Array(this.buffer.slice(this.offset,this.realOffset+=4))[0]}readDouble(e){return null!=e||(e=this.buffer.byteLength),new Float64Array(this.buffer.slice(this.offset,this.realOffset+=8))[0]}readbzString(e){return null!=e||(e=this.buffer.byteLength),this.readbString(e).slice(0,-1)}readbString(e){null!=e||(e=this.buffer.byteLength);const t=this.readByte(e);return this.readString(t,e)}readString(e,t){return null!=t||(t=this.buffer.byteLength),String.fromCharCode(...new Uint8Array(this.buffer.slice(this.offset,this.realOffset+=e)))}readByteArray(e,t){return null!=t||(t=this.buffer.byteLength),[...new Uint8Array(this.buffer.slice(this.offset,this.realOffset+=e))]}readShortArray(e,t){return null!=t||(t=this.buffer.byteLength),[...new Uint16Array(this.buffer.slice(this.offset,this.realOffset+=2*e))]}readIntArray(e,t){return null!=t||(t=this.buffer.byteLength),[...new Uint32Array(this.buffer.slice(this.offset,this.realOffset+=4*e))]}readFloatArray(e,t){return null!=t||(t=this.buffer.byteLength),[...new Float32Array(this.buffer.slice(this.offset,this.realOffset+=4*e))]}readDoubleArray(e,t){return null!=t||(t=this.buffer.byteLength),[...new Float64Array(this.buffer.slice(this.offset,this.realOffset+=8*e))]}readbStringArray(e,t){null!=t||(t=this.buffer.byteLength);let a=[];for(let r=0;r<e;++r)a.push(this.readbString(t));return a}readbzStringArray(e,t){null!=t||(t=this.buffer.byteLength);let a=[];for(let r=0;r<e;++r)a.push(this.readbzString(t));return a}}}},t={};function a(r){var s=t[r];if(void 0!==s)return s.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,a),i.exports}a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var r={};return(()=>{a.r(r),a.d(r,{RecordType:()=>d,default:()=>m});class e{constructor(e,t){this.neverRun=268435456==(268435456&e.flags),t.buffer.byteLength,t.offset}}class t{constructor(e,t){1&e.flags&&(this.flags=t.readInt()),8&e.flags&&(this.value=t.readInt()),4&e.flags&&(this.teaches=t.readByte()),t.buffer.byteLength,t.offset}}class s{constructor(e,t){var a,r;this.unknown26=[],this.seenUnknown=[],this.data=[],this.pathgridData=[];let s=t.offset;if(this.cellCreated=1==(1&e.flags),this.unknown2=4==(4&e.flags),67108864&e.flags&&(this.unknown26=t.readByteArray(4)),134217728&e.flags&&(this.time=t.readInt()),8&e.flags&&(this.flags=t.readByte()),268435456&e.flags){let i;for(let o=4;o>=0;--o){if(i=t.clone(),e.dataSize-i.offset>=32&&o>0&&(this.seenUnknown=i.readByteArray(32)),e.dataSize-i.offset>=2&&o>1&&(this.dataNum=i.readShort()),e.dataSize-i.offset>=2&&o>2&&(this.dataFlags=i.readShort()),e.dataSize-i.offset>=34*((null!==(a=this.dataNum)&&void 0!==a?a:0)-1)&&o>3)for(let t=0;t<(null!==(r=this.dataNum)&&void 0!==r?r:0)-1&&(this.data.push(i.readByteArray(34)),!(i.offset>s+e.dataSize));++t);if(16&e.flags&&e.dataSize-i.offset>=1&&e.dataSize-i.offset>=1+i.peekByte()&&(this.fullName=i.readbString()),32&e.flags&&e.dataSize-i.offset>=4&&(this.owner=i.readInt()),16777216&e.flags&&e.dataSize-i.offset>=2&&e.dataSize-i.offset>=2+2*i.peekShort()&&(this.pathgridDataLen=i.readShort(),this.pathgridData=i.readShortArray(this.pathgridDataLen)),i.offset-s===e.dataSize)break;delete this.dataNum,delete this.dataFlags,delete this.fullName,delete this.owner,delete this.pathgridDataLen,this.seenUnknown=[],this.data=[],this.pathgridData=[]}i&&t.advance(i.offset-t.offset)}else if(16&e.flags&&(this.fullName=t.readbString()),32&e.flags&&(this.owner=t.readInt()),16777216&e.flags){this.pathgridDataLen=t.readShort();for(let e=0;e<this.pathgridDataLen;++e)this.pathgridData.push(t.readShort())}t.buffer.byteLength,t.offset}}class i{constructor(e,t){if(this.factions=[],this.spellIds=[],this.aiData=[],this.modifiers=[],1&e.flags&&(this.flags=t.readInt()),8&e.flags&&(this.strength=t.readByte(),this.intelligence=t.readByte(),this.willpower=t.readByte(),this.agility=t.readByte(),this.speed=t.readByte(),this.endurance=t.readByte(),this.personality=t.readByte(),this.luck=t.readByte()),16&e.flags&&(this.dataFlags=t.readInt(),this.baseMagicka=t.readShort(),this.baseFatigue=t.readShort(),this.barterGold=t.readShort(),this.level=t.readShort(),this.calcMin=t.readShort(),this.calcMax=t.readShort()),64&e.flags){this.factionsNum=t.readShort();for(let e=0;e<this.factionsNum;++e){let e=t.readInt(),a=t.readByte();this.factions.push({faction:e,factionRank:a})}}if(32&e.flags){this.spellCount=t.readShort();for(let e=0;e<this.spellCount;++e)this.spellIds.push(t.readInt())}if(256&e.flags&&(this.aiData.push(t.readByte()),this.aiData.push(t.readByte()),this.aiData.push(t.readByte()),this.aiData.push(t.readByte())),4&e.flags&&(this.baseHealth=t.readInt()),268435456&e.flags){this.modCount=t.readShort();for(let e=0;e<this.modCount;++e){let e=t.readByte(),a=t.readFloat();this.modifiers.push({valueIndex:e,modValue:a})}}128&e.flags&&(this.fullName=t.readbString()),512&e.flags&&(this.armorer=t.readByte(),this.athletics=t.readByte(),this.blade=t.readByte(),this.block=t.readByte(),this.blunt=t.readByte(),this.handToHand=t.readByte(),this.heavyArmor=t.readByte(),this.alchemy=t.readByte(),this.alteration=t.readByte(),this.conjuration=t.readByte(),this.destruction=t.readByte(),this.illusion=t.readByte(),this.mysticism=t.readByte(),this.restoration=t.readByte(),this.acrobatics=t.readByte(),this.lightArmor=t.readByte(),this.marksman=t.readByte(),this.mercantile=t.readByte(),this.security=t.readByte(),this.sneak=t.readByte(),this.speechcraft=t.readByte()),1024&e.flags&&(this.combatStyle=t.readInt()),t.buffer.byteLength,t.offset}}const o=(e,t)=>{let a=e.readShort(),r=[];if(e.offset>t)return{propertiesNum:a,properties:r};for(let s=0;s<a;++s){let s,i=e.readByte();if(e.offset>t)return{propertiesNum:a,properties:r};switch(i){case 17:case 34:case 39:case 40:case 41:case 60:case 72:case 82:case 83:s=e.readInt();break;case 18:s={},s.scriptref=e.readInt(),s.varNum=e.readShort(),s.variables=[];for(let i=0;i<s.varNum;++i){let i={};if(i.varIndex=e.readShort(),i.varType=e.readShort(),61440===i.varType&&(i.refVar=e.readInt()),0===i.varType&&(i.refVar=e.readDouble()),s.variables.push(i),e.offset>t)return{propertiesNum:a,properties:r}}s.unknown=e.readByte();break;case 27:case 28:case 37:case 71:case 80:s=1;break;case 30:s={},s.cell=e.readInt(),s.x=e.readFloat(),s.y=e.readFloat(),s.z=e.readFloat(),s.flags=e.readInt();break;case 31:s={},s.package=e.readInt(),s.flags=e.readInt(),s.package2=e.readInt(),s.unknown=e.readShort();break;case 32:s={},s.formId=e.readInt(),s.data=e.readByteArray(59);break;case 33:s={},s.dataNum=e.readShort(),s.data=[];for(let i=0;i<s.dataNum;++i){let i={};if(i.iref=e.readInt(),i.unknown=e.readByte(),s.data.push(i),e.offset>t)return{propertiesNum:a,properties:r}}break;case 35:s={},s.dataNum=e.readShort(),s.data=[];for(let i=0;i<s.dataNum;++i)if(s.data.push(e.readInt()),e.offset>t)return{propertiesNum:a,properties:r};break;case 42:s=e.readShort();break;case 43:case 45:case 46:case 55:case 61:case 65:case 92:s=e.readFloat();break;case 44:case 47:case 51:case 85:case 90:s=e.readByte();break;case 49:s={},s.lockLevel=e.readByte(),s.key=e.readInt(),s.flag=e.readByte();break;case 50:s={},s.x=e.readFloat(),s.y=e.readFloat(),s.z=e.readFloat(),s.rX=e.readFloat(),s.rY=e.readFloat(),s.rZ=e.readFloat(),s.destDoor=e.readInt();break;case 53:break;case 54:s=e.readByteArray(5);break;case 57:s=e.readByteArray(12);break;case 58:s={},s.iref=e.readInt(),s.dataNum=e.readShort(),s.data=[];for(let i=0;i<s.dataNum;++i)if(s.data.push(e.readByteArray(61)),e.offset>t)return{propertiesNum:a,properties:r};break;case 62:s={},s.door=e.readInt(),s.x=e.readFloat(),s.y=e.readFloat(),s.z=e.readFloat();break;case 74:s=e.readbString();break;case 75:s={},s.unknown=e.readInt(),s.dataNum=e.readShort(),s.data=e.readByteArray(s.dataNum);break;case 78:s={},s.dataNum=e.readShort(),s.data=[];for(let i=0;i<s.dataNum;++i)if(s.data.push(e.readByteArray(10)),e.offset>t)return{propertiesNum:a,properties:r};break;case 79:s=e.readByteArray(4);break;case 89:s={},s.convTopic=e.readbString(),s.unknown=e.readByte(),s.convNum=e.readByte(),s.conv=[];for(let i=0;i<s.convNum;++i){let i={};if(i.index=e.readByte(),i.convQuest=e.readInt(),i.convDialog=e.readInt(),i.convInfo=e.readInt(),s.conv.push(i),e.offset>t)return{propertiesNum:a,properties:r}}}if(r.push({flag:i,value:s}),e.offset>t)return{propertiesNum:a,properties:r}}return{propertiesNum:a,properties:r}};var d,n=a(727);class h{constructor(e,t){if(this.statistics={skillAdvances:e.readInt(t),unknown1:e.readInt(t),largestBounty:e.readInt(t),killedCreatures:e.readInt(t),killedPersons:e.readInt(t),exploredPlaces:e.readInt(t),lockPicked:e.readInt(t),picksBroken:e.readInt(t),capturedSouls:e.readInt(t),usedIngredients:e.readInt(t),mixedPotions:e.readInt(t),oblivionGatesClosed:e.readInt(t),horsesOwned:e.readInt(t),housesOwned:e.readInt(t),investments:e.readInt(t),booksRead:e.readInt(t),teachingBooksRead:e.readInt(t),artifactsFound:e.readInt(t),hoursSlept:e.readInt(t),hoursWaited:e.readInt(t),unknown2:e.readInt(t),unknown3:e.readInt(t),unknown4:e.readInt(t),jokesTold:e.readInt(t),disease:e.readInt(t),nirnrootFound:e.readInt(t),burglary:e.readInt(t),pickpocketing:e.readInt(t),unknown5:e.readInt(t),attacks:e.readInt(t),murder:e.readInt(t),stolenHorses:e.readInt(t),unknown6:e.readInt(t),unknown7:e.readInt(t)},!(e.offset>t)){this.unknown1=e.readByte(t),this.unknown2=e.readByteArray(95),this.unknown3=e.readByteArray(22),this.pcBirthsign=e.readInt(t),this.unknownArray=[];for(let a=0;a<13;++a)this.unknownArray.push(e.readInt(t));if(!(e.offset>t)){this.num2=e.readShort(t),this.unknown4=e.readByteArray(2),this.unknown5=[];for(let t=0;t<this.num2;++t)this.unknown5.push(e.readByteArray(4));if(!(e.offset>t)){this.unknown6=e.readByteArray(2),this.randODoorsNum=e.readShort(t),this.randODoors=[];for(let a=0;a<this.randODoorsNum;++a)this.randODoors.push({door:e.readInt(t),flag:e.readByte(t)});if(!(e.offset>t)){this.unknown7=e.readByteArray(2),this.activeEffectsNum=e.readShort(t),this.activeEffects=[];for(let a=0;a<this.activeEffectsNum;++a){let a=e.readShort(t);this.activeEffects.push({size:a,reference:e.readInt(t),index:e.readByte(t),effectDetails:e.readByteArray(a)})}if(!(e.offset>t||(this.expPoints={armorer:e.readFloat(t),athletics:e.readFloat(t),blade:e.readFloat(t),block:e.readFloat(t),blunt:e.readFloat(t),handToHand:e.readFloat(t),heavyArmor:e.readFloat(t),alchemy:e.readFloat(t),alteration:e.readFloat(t),conjuration:e.readFloat(t),destruction:e.readFloat(t),illusion:e.readFloat(t),mysticism:e.readFloat(t),restoration:e.readFloat(t),acrobatics:e.readFloat(t),lightArmor:e.readFloat(t),marksman:e.readFloat(t),mercantile:e.readFloat(t),security:e.readFloat(t),sneak:e.readFloat(t),speechcraft:e.readFloat(t)},e.offset>t))){this.advancement=e.readInt(t),this.attrSkillCounts=[];for(let a=0;a<this.advancement;++a)if(this.attrSkillCounts.push({strength:e.readByte(t),intelligence:e.readByte(t),willpower:e.readByte(t),agility:e.readByte(t),speed:e.readByte(t),endurance:e.readByte(t),personality:e.readByte(t),luck:e.readByte(t)}),e.offset>t)return;if(this.specCounts={combat:e.readByte(t),magic:e.readByte(t),stealth:e.readByte(t)},!(e.offset>t||(this.skillUsage={armorer:e.readInt(t),athletics:e.readInt(t),blade:e.readInt(t),block:e.readInt(t),blunt:e.readInt(t),handToHand:e.readInt(t),heavyArmor:e.readInt(t),alchemy:e.readInt(t),alteration:e.readInt(t),conjuration:e.readInt(t),destruction:e.readInt(t),illusion:e.readInt(t),mysticism:e.readInt(t),restoration:e.readInt(t),acrobatics:e.readInt(t),lightArmor:e.readInt(t),marksman:e.readInt(t),mercantile:e.readInt(t),security:e.readInt(t),sneak:e.readInt(t),speechcraft:e.readInt(t)},e.offset>t))){this.majorSkillAdv=e.readInt(t),this.unknown8=e.readByte(t),this.activeQuest=e.readInt(t),this.knownTopicsNum=e.readShort(t),this.knownTopics=[];for(let a=0;a<this.knownTopicsNum;++a)this.knownTopics.push(e.readInt(t));if(!(e.offset>t)){this.openQuestsNum=e.readShort(t),this.openQuests=[];for(let a=0;a<this.openQuestsNum;++a)this.openQuests.push({quest:e.readInt(t),questStage:e.readByte(t),logEntry:e.readByte(t)});if(!(e.offset>t)){this.magEffectNum=e.readInt(t),this.magEffects=[];for(let a=0;a<this.magEffectNum;++a)if(this.magEffects.push({edid:e.readString(4)}),e.offset>t)return;this.fgGeoSym=e.readByteArray(200),this.fgGeoAsym=e.readByteArray(120),this.fgTexSym=e.readByteArray(200),this.race=e.readInt(t),this.hair=e.readInt(t),this.eyes=e.readInt(t),this.hairLength=e.readFloat(t),this.hairColor=e.readByteArray(3),this.unknown9=e.readByte(t),this.gender=e.readByte(t),this.pcName=e.readbzString(t),this.pcClass=e.readInt(t),t>e.offset&&(this.customClass_favoredAttribute1=e.readInt(t),this.customClass_favoredAttribute2=e.readInt(t),this.customClass_specialization=e.readInt(t),this.customClass_majorSkill1=e.readInt(t),this.customClass_majorSkill2=e.readInt(t),this.customClass_majorSkill3=e.readInt(t),this.customClass_majorSkill4=e.readInt(t),this.customClass_majorSkill5=e.readInt(t),this.customClass_majorSkill6=e.readInt(t),this.customClass_majorSkill7=e.readInt(t),this.customClass_flags=e.readInt(t),this.customClass_services=e.readInt(t),this.customClass_skillTrained=e.readByte(t),this.customClass_maxTrainingLevel=e.readByte(t),this.customClass_unused=e.readByteArray(2,t),this.customClass_name=e.readbString(t),this.customClass_icon=e.readbString(t)),this.unknown10=e.readInt(t)}}}}}}}}}}class l{constructor(e,t){if(this.tempAttributeChanges_activeEffects=[],this.tempAttributeChanges_unknownEffects=[],this.tempAttributeChanges_damageEffects=[],this.inventory_items=[],this.havokMoved_data=[],this.properties=[],!e.data)return;const a=t.offset,r=a+e.dataSize;try{if(20===e.formId){let r;for(let a=e.dataSize-1;a>=0;--a)if(66===e.data[a]&&150===e.data[a-1]&&66===e.data[a-21]&&236===e.data[a-22]){r=t.offset+a+29;break}void 0===r||(this.player=new h(new n.Y(t.buffer,r),a+e.dataSize))}if(2147483648&e.flags&&(this.cellChanged_cell=t.readInt(r),this.cellChanged_x=t.readFloat(r),this.cellChanged_y=t.readFloat(r),this.cellChanged_z=t.readFloat(r)),2&e.flags&&(this.created_flags=t.readInt(r),this.created_baseItem=t.readInt(r),this.created_cell=t.readInt(r),this.created_x=t.readFloat(r),this.created_y=t.readFloat(r),this.created_z=t.readFloat(r),this.created_rX=t.readFloat(r),this.created_rY=t.readFloat(r),this.created_rZ=t.readFloat(r)),4&e.flags){if(this.moved_cell=t.readInt(r),0===this.moved_cell&&e.dataSize<=5)return void(this.actorFlag=t.readByte(r));this.moved_x=t.readFloat(r),this.moved_y=t.readFloat(r),this.moved_z=t.readFloat(r),this.moved_rX=t.readFloat(r),this.moved_rY=t.readFloat(r),this.moved_rZ=t.readFloat(r)}if(8&e.flags&&!(2&e.flags||4&e.flags)&&(this.havokMoved_cell=t.readInt(r),this.havokMoved_x=t.readFloat(r),this.havokMoved_y=t.readFloat(r),this.havokMoved_z=t.readFloat(r),this.havokMoved_rX=t.readFloat(r),this.havokMoved_rY=t.readFloat(r),this.havokMoved_rZ=t.readFloat(r)),8388608&e.flags&&!(2&e.flags||4&e.flags||8&e.flags)&&(this.oblivionCell=t.readInt(r)),20===e.formId){for(let e=0;e<71;++e)this.tempAttributeChanges_activeEffects.push(t.readFloat(r));for(let e=0;e<71;++e)this.tempAttributeChanges_unknownEffects.push(t.readFloat(r));for(let e=0;e<71;++e)this.tempAttributeChanges_damageEffects.push(t.readFloat(r));this.tempAttributeChanges_deltaHealth=t.readFloat(r),this.tempAttributeChanges_deltaMagicka=t.readFloat(r),this.tempAttributeChanges_deltaFatigue=t.readFloat(r)}if(this.actorFlag=t.readByte(r),1&e.flags&&(this.flags=t.readInt(r)),134217728&e.flags){this.inventory_itemNum=t.readShort(r);for(let s=0;s<this.inventory_itemNum;++s){let s=t.readInt(r),i=t.readInt(r),d=t.readInt(r),n=[];for(let r=0;r<d;++r)n.push(o(t,a+e.dataSize));this.inventory_items.push({iref:s,stackedItemsNum:i,changedEntriesNum:d,changedEntries:n})}}let s=o(t,a+e.dataSize);this.propertiesNum=s.propertiesNum,this.properties=s.properties,8&e.flags&&!(2&e.flags||4&e.flags)&&(this.havokMoved_dataLen=t.readShort(r),this.havokMoved_data=t.readByteArray(this.havokMoved_dataLen)),16&e.flags&&(this.scale=t.readFloat(r)),this.enabled=1073741824==(1073741824&e.flags)}catch(e){console.log(e)}t.buffer.byteLength,t.offset}}class f{constructor(e,t){this.topicSaidOnce=268435456==(268435456&e.flags),t.buffer.byteLength,t.offset}}class c{constructor(e,t){if(this.reactions=[],8&e.flags){this.reactionsNum=t.readShort();for(let e=0;e<this.reactionsNum;++e){let e=t.readInt(),a=t.readInt();this.reactions.push({unknown1:e,unknown2:a})}}4&e.flags&&(this.flags=t.readByte()),t.buffer.byteLength,t.offset}}class u{constructor(e,t){1&e.flags&&(this.flags=t.readInt()),8&e.flags&&(this.value=t.readInt()),t.buffer.byteLength,t.offset}}class y{constructor(e,t){this.inventory_items=[],this.havokMoved_data=[],this.properties=[];const a=t.offset+e.dataSize;try{const r=t.offset;if(2147483648&e.flags&&(this.cellChanged_cell=t.readInt(a),this.cellChanged_x=t.readFloat(a),this.cellChanged_y=t.readFloat(a),this.cellChanged_z=t.readFloat(a)),2&e.flags&&(this.created_flags=t.readInt(a),this.created_baseItem=t.readInt(a),this.created_cell=t.readInt(a),this.created_x=t.readFloat(a),this.created_y=t.readFloat(a),this.created_z=t.readFloat(a),this.created_rX=t.readFloat(a),this.created_rY=t.readFloat(a),this.created_rZ=t.readFloat(a)),4&e.flags){if(this.moved_cell=t.readInt(a),0===this.moved_cell&&e.dataSize<=5)return void(this.actorFlag=t.readByte(a));this.moved_x=t.readFloat(a),this.moved_y=t.readFloat(a),this.moved_z=t.readFloat(a),this.moved_rX=t.readFloat(a),this.moved_rY=t.readFloat(a),this.moved_rZ=t.readFloat(a)}if(8&e.flags&&!(2&e.flags||4&e.flags)&&(this.havokMoved_cell=t.readInt(a),this.havokMoved_x=t.readFloat(a),this.havokMoved_y=t.readFloat(a),this.havokMoved_z=t.readFloat(a),this.havokMoved_rX=t.readFloat(a),this.havokMoved_rY=t.readFloat(a),this.havokMoved_rZ=t.readFloat(a)),8388608&e.flags&&!(2&e.flags||4&e.flags||8&e.flags)&&(this.oblivionCell=t.readInt(a)),1&e.flags&&(this.flags=t.readInt(a)),134217728&e.flags){this.inventory_itemNum=t.readShort(a);for(let s=0;s<this.inventory_itemNum;++s){if(t.offset-r>e.dataSize)return;let s=t.readInt(a),i=t.readInt(a),d=t.readInt(a),n=[];for(let a=0;a<d;++a){if(t.offset-r>e.dataSize)return;n.push(o(t,r+e.dataSize))}this.inventory_items.push({iref:s,stackedItemsNum:i,changedEntriesNum:d,changedEntries:n})}}if(389022944&e.flags){if(t.offset-r>e.dataSize)return;let a=o(t,r+e.dataSize);this.propertiesNum=a.propertiesNum,this.properties=a.properties}8&e.flags&&!(2&e.flags||4&e.flags)&&(this.havokMoved_dataLen=t.readShort(a),this.havokMoved_data=t.readByteArray(this.havokMoved_dataLen,a)),16&e.flags&&(this.scale=t.readFloat(a)),this.enabled=1073741824==(1073741824&e.flags)}catch(e){console.log(e)}t.buffer.byteLength,t.offset}}class g{constructor(e,t){this.stage=[],this.data=[];const a=t.offset;if(4&e.flags&&(this.flags=t.readByte()),268435456&e.flags){this.stageNum=t.readByte();for(let e=0;e<this.stageNum;++e){let e=t.readByte(),a=t.readByte(),r=t.readByte(),s=[];for(let e=0;e<r;++e){let e=t.readByte(),a=t.clone(),r=t.clone(),i=t.readFloat(),o=a.readInt(),d=r.readByteArray(4);s.push({entryNum:e,entryValFloat:i,entryValInt:o,entryValByteArray:d})}this.stage.push({index:e,flag:a,entryNum:r,entries:s})}}if(134217728&e.flags){this.dataNum=t.readShort(),this.dataUnknown=t.readByte();for(let r=0;r<this.dataNum;++r){let s=12;if(r+1===this.dataNum&&(s=a+e.dataSize-t.offset),this.data.push(t.readByteArray(s)),t.offset>a+e.dataSize)break}}t.buffer.byteLength,t.offset}}!function(e){e[e.Faction=6]="Faction",e[e.AlchemicalApparatus=19]="AlchemicalApparatus",e[e.Armor=20]="Armor",e[e.Book=21]="Book",e[e.Clothing=22]="Clothing",e[e.Ingredient=25]="Ingredient",e[e.Light=26]="Light",e[e.Miscellaneous=27]="Miscellaneous",e[e.Weapon=33]="Weapon",e[e.Ammo=34]="Ammo",e[e.NPC=35]="NPC",e[e.Creature=36]="Creature",e[e.SoulGem=38]="SoulGem",e[e.Key=39]="Key",e[e.Potion=40]="Potion",e[e.Cell=48]="Cell",e[e.InstanceReference=49]="InstanceReference",e[e.CharacterReference=50]="CharacterReference",e[e.CreatureReference=51]="CreatureReference",e[e.Dialog=58]="Dialog",e[e.Quest=59]="Quest",e[e.AI=61]="AI"}(d||(d={}));class m{constructor(e){this.formId=0,this.type=0,this.flags=0,this.version=0,this.dataSize=0,this.formId=e.readInt(),this.type=e.readByte(),this.flags=e.readInt(),this.version=e.readByte(),this.dataSize=e.readShort(),this.data=e.readByteArray(this.dataSize)}get subRecord(){if(!this.data)return this.parsedSubRecord;const a=new ArrayBuffer(this.dataSize),r=new Uint8Array(a);for(let e=0;e<this.dataSize;++e)r[e]=this.data[e];const o=new n.Y(a,0);switch(this.type){case d.Book:this.parsedSubRecord=new t(this,o);break;case d.Faction:this.parsedSubRecord=new c(this,o);break;case d.AlchemicalApparatus:case d.Armor:case d.Clothing:case d.Ingredient:case d.Light:case d.Miscellaneous:case d.Ammo:case d.SoulGem:case d.Potion:case d.Weapon:case d.Key:this.parsedSubRecord=new u(this,o);break;case d.NPC:case d.Creature:this.parsedSubRecord=new i(this,o);break;case d.Cell:this.parsedSubRecord=new s(this,o);break;case d.InstanceReference:this.parsedSubRecord=new y(this,o);break;case d.CharacterReference:case d.CreatureReference:this.parsedSubRecord=new l(this,o);break;case d.Dialog:this.parsedSubRecord=new f(this,o);break;case d.Quest:this.parsedSubRecord=new g(this,o);break;case d.AI:this.parsedSubRecord=new e(this,o)}return this.parsedSubRecord&&delete this.data,this.parsedSubRecord}}})(),r})()}));
//# sourceMappingURL=bundle.record.js.map