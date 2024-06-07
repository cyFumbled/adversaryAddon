'use strict';

import { ItemStack, system , world } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

let commandHandler = {
    commandReference : {
        'clearpd' : {
            requiredPermissionLevel: 1, code: ({source: player}) => {
                factoryResetPersonalSessionData(player.name)
                assignPlayerLabel(player)
                syncPlayerData(player.name,'session') 
            }},
        'cleartasks' : {
            requiredPermissionLevel: 1, code: () => {
                taskManagement.clearTasks();
            }},
        'createVacantWorkshop' : {
            requiredPermissionLevel: 1, code : ({parameters : [size]}) => {
                size = Number(size)
                console.warn('size: ' + size)
                const nextNWPos = JSON.parse(world.getDynamicProperty('nextNWPos'));
                const southeastPos = {x : nextNWPos.x + size, y : nextNWPos.y + size, z : nextNWPos.z + size}
                console.warn(JSON.stringify(southeastPos))
                workshopManagementSystem.createSite(nextNWPos,{x : nextNWPos.x + size, y : nextNWPos.y + size, z : nextNWPos.z + size},'aa:workshopborder',16)
                console.warn('test33')
                workshopManagementSystem.vacantWorkshops.push({
                    key: world.getDynamicProperty('highestWorkshopKey'),
                    privacy : 'private',
                    archivePos : {
                        northWest : nextNWPos,
                        southEast : southeastPos
                    }
                })

                world.setDynamicProperty('vacantWorkshops',JSON.stringify(workshopManagementSystem.vacantWorkshops))
                world.setDynamicProperty('nextNWPos',JSON.stringify({x : nextNWPos.x, y: nextNWPos.y, z: nextNWPos.z + Number(size) + 100}))
                world.setDynamicProperty('highestWorkshopKey',world.getDynamicProperty('highestWorkshopKey') + 1)
            

            }
        },
        'createsite' : {
            requiredPermissionLevel: 1, code: ({parameters}) => {
                workshopManagementSystem.createSite(
                    {
                        'x':Number(parameters[0]),
                        'y':Number(parameters[1]),
                        'z':Number(parameters[2])
                    },
                    {
                        'x':Number(parameters[3]),
                        'y':Number(parameters[4]),
                        'z':Number(parameters[5])
                    },
                    parameters[6],
                    parameters[7]
                )
            }},
        'debugWorkshopData' : {
            requiredPermissionLevel: 1, code : () => {
                console.warn('highest key: ' + world.getDynamicProperty('highestWorkshopKey') + ' nextNWPos : ' + world.getDynamicProperty('nextNWPos') + '\nvacant workshops: ' + world.getDynamicProperty('vacantWorkshops'))
            }
        }, 
        'displaypd' : {
            requiredPermissionLevel: 1, code: ({source : player}) => {
                console.warn(`\nDynamic Property Player Data: §b${world.getDynamicProperty(player.name)}§r
                \nActive Session Player Data: §b${JSON.stringify(sessionPlayerData[player.name])}§r
                \nIs Player Dp undefined: §b${world.getDynamicProperty(player.name) === undefined}`);
            }},
        'dpsharedsize' : {
            requiredPermissionLevel: 1, code: () => {
                console.warn(`Dynamic Property Byte Count: ${world.getDynamicPropertyTotalByteCount()}`);
            }},
        'gmc' : {
            requiredPermissionLevel: 1, code: ({source: player}) => {
                console.warn(player.name)
                world.getDimension('overworld').runCommandAsync(`gamemode c ${player.name}`);
            }},
        'gms' : {
            requiredPermissionLevel: 1, code: ({source: player}) => {
                world.getDimension('overworld').runCommandAsync(`gamemode s ${player.name}`);
            }},
        'logMap': {
            requiredPermissionLevel: 1, code: ({parameters}) => {
                if (parameters[0] === 'all' || !parameters[0]) console.warn(world.getDynamicProperty('mapList'));
                else console.warn(world.getDynamicProperty(parameters[0]));
            }
        },
        'logmaplist' : {
            requiredPermissionLevel: 1, code: () => {
                uploadMapData({
                    id: 'Alloy_Station',
                    title: 'Alloy Station',
                    key: 1,
                    owner: 'TornAlloy808450',
                    builders : ['TornAlloy808450'],
                    rivacy : 'public',
                    passcode : '60',
                    developmentaState : 'unreleased',
                    mapVersion : '0.1',
                    creationVersion : '0.0.5',
                    compatableGamemodes : ['training'],
                    archivePos : {
                        northWest : {
                            x:800,
                            y:0,
                            z:800
                        },
                        southEast : {
                            x:900,
                            y:200,
                            z:900
                        }
                    }
                })
                console.warn('Debug Sys', 'global', world.getDynamicProperty('mapList'))
            }},
        'logmapdata' : {
            requiredPermissionLevel: 1, code: () => {
                console.warn(chatHandler.deliverMessage('Debug Sys', 'global', JSON.stringify(downloadMapData('Alloy Station'))));
            }},
        'openownershipForm' : {
            requiredPermissionLevel: 1, code: ({source: player}) => {
                system.run(() => workshopManagementSystem.showOwnershipForm(player));
            }},
        'posworkshopnpc' : {
            requiredPermissionLevel: 1, code: ({source: player}) => {
                player.runCommandAsync(`tp @s 202 -57 88 facing  204 -58 88`)
            }},
        'prefix' : {
            requiredPermissionLevel: 1, code: ({source: player},parameters) => {
                sessionPlayerData[player.name].prefix = parameters[0];
                player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§8Active Prefix: §b${sessionPlayerData[player.name].prefix}"}]}`);
                syncPlayerData(player.name,'session')
                console.warn(`${player.name}'s active prefix: §b${sessionPlayerData[player.name].prefix}`);
            }},
        'reloadlabel' : {
            requiredPermissionLevel: 1, code: ({source: player}) => {
                system.run(assignPlayerLabel(player));
                console.warn(`Nametag: ${player.nameTag}`);
            }},
        'removeMap' : {
            requiredPermissionLevel: 1, code : ({parameters : [mapId]}) => {
                const mapName = mapId.replace('_', ' ')

            console.warn(JSON.parse(world.getDynamicProperty('mapList'))[mapName])
            world.setDynamicProperty(JSON.parse(world.getDynamicProperty('mapList'))[mapName],undefined)
            console.warn(JSON.parse(world.getDynamicProperty('mapList'))[mapName])
            let mapList = JSON.parse(world.getDynamicProperty('mapList'))
            delete mapList[mapName]
            console.warn(JSON.stringify(mapList))
            world.setDynamicProperty('mapList',JSON.stringify(mapList))
        

            }
        },
        'runjs' : {
            requiredPermissionLevel: 1, code: () => {
                let code = '';
                    for (let param in cmdParameters) {
                        code = code + ' ' + cmdParameters[param]
                    }
                    eval(code);
            }},
        'refreshpd' : {
            requiredPermissionLevel: 1, code: () => {
                assignPlayerLabel(player);
                syncPlayerData(player.name,'session');
            }},
        'setstation' : {
            requiredPermissionLevel: 1, code: ({source: player},parameters) => {
                if (parameters.length < 2) system.run(setStation(player, parameters[0]));
                else  setStation(world.getPlayers({ name:parameters[1]})[0], parameters[0]);
            }}
    },

    parseChatMessage : (prefix,message) => {
        let [keyword, ...parameters] = message.split(prefix)[1].split(' ');
        return commandHandler.commandReference.hasOwnProperty(keyword) ? { keyword, parameters}
            : console.warn(`Failed to parse unrecognised command keyword.\n§7keyword: §b${keyword}§7\nparameters: §b${parameters}`);
    },

    runCommand : function (source,keyword,parameters) {

        const sourcePermissionLevel = {
            '-4294967295' : 1
        }

        if (this.commandReference[keyword].requiredPermissionLevel > sourcePermissionLevel[source.id]) {
            console.warn(`\nFailed to run command due with an unauthorised permission level.\nsource name: §b${source.name}§7\nkeyword: §b${keyword}§7\nparameters: §b${parameters}§7\ncommand permission level: §b${this.commandReference[keyword].requiredPermissionLevel}§7\nsource permission level: §b${sourcePermissionLevel[source.id]}`)
            return
        }
        else {
            this.commandReference[keyword].code({source, parameters});
            console.warn(`\nSuccessfully ran custom command.§7\nsource name: §b${source.name}§7\nkeyword: §b${keyword}§7\nparameters: §b${parameters}§7\ncommand permission level: §b${this.commandReference[keyword].requiredPermissionLevel}§7\nsource permission level: §b${sourcePermissionLevel[source.id]}`)
        }
    }
}


let chatHandler = {

    channels : {'global':[],'lobby':[],'botAnnouncements':[]},

    deliverMessage : function(sender,channel,text) {
        if (world.getPlayers({name:sender})[0] !== undefined) {sender = sessionPlayerData[sender].label; text = text.replace('§', '');}

        let message = `§l${sender}\n§r    ${text}`

        for (let i in this.channels[channel]) {
            
            const player = world.getPlayers({name:this.channels[channel][i]})[0];
            player.sendMessage(message);
        }
    }

};

let trainingHandler = {

    queue : [],
    auctionVoters : [],
    kitSelectionVoters : [],

    countdown : "",

    queueAddPlayer : function(player, voteSelection) {

        console.warn(`recognised player (${player.name}) being added to queue`)
        this.queue.push(player.name);
        if (voteSelection) this.submitVote(player,voteSelection);

        sessionPlayerData[player.name].station = 'trainingQueue'
        this.beginCountdown()
    },

    queueRemovePlayer : function (player) {
        this.queue.splice(this.queue.indexOf(player.name),1)
        if (this.auctionVoters.includes(player.name)) this.auctionVoters.splice(this.auctionVoters.indexOf(player.name),1);
        else if (this.kitSelectionVoters.includes(player.name)) this.kitSelectionVoters.splice(this.kitSelectionVoters.indexOf(player.name),1);

        sessionPlayerData[player.name].station = 'lobby'

        console.warn(`Removed ${player.name}.`)

        if (this.queue < 1) this.cancelCountdown() 
    },

    removeVote : function (player) {
        if (this.auctionVoters.includes(player.name)) this.auctionVoters.splice(this.auctionVoters.indexOf(player.name),1);
        if (this.kitSelectionVoters.includes(player.name)) this.kitSelectionVoters.splice(this.kitSelectionVoters.indexOf(player.name),1);
    },

    submitVote : function (player,selection) {
        console.warn(`§b${player.name}§r voted for §b${selection}§r.`) 
        switch (selection) {
            case 'auction' : this.auctionVoters.push(player.name);
                break;
            case 'kitSelection' : this.kitSelectionVoters.push(player.name);
                break;
        }
    },

    cancelCountdown : function () {
        chatHandler.deliverMessage(`§2Training Transporter`,'botAnnouncements',`Training session canceled.`)
        system.clearRun(this.countdown)
    },

    beginCountdown : function () {
        chatHandler.deliverMessage(`§2Training Transporter`,'botAnnouncements',`Training beginning in §btwenty§r seconds.`)
        this.countdown = system.runTimeout(() => {
            console.warn('Countdown finished')
          }, 100)
    }
}

let taskManagement = {
    lifetimeTaskCount : 0,
    targetPriority : 'z',
    totalQueueing : 0,

    priorityList : ['a','b','c','d','e'],
    aQueue : [],
    bQueue : [],
    cQueue : [],
    dQueue : [],
    EQueue : [],

    clearTasks : function() {

        this.totalQueueing = 0;
        this.aQueue = [];
        this.bQueue = [];
        this.cQueue = [];
        this.dQueue = [];
        this.eQueue = [];

        console.warn("Cleared All Tasks.")
    },

    newTask : function(priority,data) {

        this.lifetimeTaskCount++;
        this.totalQueueing++;
       // console.warn('Testing ' + this[`${priority}Queue`])
        this[`${priority}Queue`].push(JSON.stringify(data));
        if (this.targetPriority > priority)  this.targetPriority = priority;
        if (this.totalQueueing == 1) this.completeTasks() 

    },

    completeTasks : function () {
        system.runTimeout( ()=> {
        let currentPriority = this.targetPriority;

        // If tasks have been cleared, return to prevent an json.parse error
        if (this[`${currentPriority}Queue`][0] == undefined) return;

        // Parse the first item of the current priority array
        let taskData = JSON.parse(JSON.parse(this[`${currentPriority}Queue`][0]))

        switch (taskData.taskId) {

            case 'fill': 

                console.warn(`Filling ${taskData.northWestPos.x}, ${taskData.northWestPos.y}, ${taskData.northWestPos.z} - ${taskData.southEastPos.x}, ${taskData.southEastPos.y}, ${taskData.southEastPos.z} with ${taskData.blockId}..`)
                world.getDimension('overworld').fillBlocks(taskData.northWestPos,taskData.southEastPos,taskData.blockId)

            break;
            case 'removeTickingarea':
                world.getDimension("overworld").runCommandAsync(`tickingarea remove ${taskData.pos.x} ${taskData.pos.y} ${taskData.pos.z}`)
                console.warn('Ticking area removed.')
                break;
            default : 

                console.warn(`Unrecognised taskId: ${taskData.taskId}`)

            break;

            }
        
        
        this[`${currentPriority}Queue`].shift();
        this.totalQueueing--;
        
        if (this.totalQueueing == 0) {
            console.warn(`completed all queued tasks.`);
            return;
        }

        if (this[`${this.targetPriority}Queue`.length == 0]) {
            console.warn(`LocatingNextPriority`)
            this.targetPriority = this.priorityList[this.priorityList.indexOf(this.targetPriority)-1]
        }

        this.completeTasks();
    }, 1)
    }

}

// Temporary data correction


let workshopManagementSystem = {
    activeWorkshops : {},
    vacantWorkshops : [],
    workShops : {},
    formData : {},

    showForm : function  (player,purpose,sourceMapName) {
        this.formData[player.name].form.show(player).then(r => {
                if (r.canceled) {
                    if (r.cancelationReason === 'UserBusy') this.showForm(player,purpose)
                    return;
                }
            if (purpose === 'design' || purpose === 'modify') {
            if (r.selection === 0) {

                const form = new ModalFormData();
        form.textField(`Map Name`,`${player.name}'s Map`)
        form.dropdown(`Map Size`,[`100x 100y 100z`]);
        form.textField(`Passcode`,``)
        form.toggle(`Public?`);
        form.textField('Builders (names seperated by colons)',`${player.name}:username2`)
        form.title(`Map creation form`)
                this.formData[player.name].form = form;
                this.showForm(player,'newMap')
                return
            }
            const selectedMap = this.formData[player.name].mapSelection[r.selection - 1];
            this[`${purpose}Map`](player,selectedMap)
            this.formData[player.name] = null;
            }
            else if (purpose === 'metadata') {

                let [mapName, mapSize, passcode, privacyToggle,builders] = r.formValues
                mapSize = [`100x 100y 100z`,`200x 200y 200z`][mapSize]
                
                mapName = mapName || sourceMapName;
                builders = builders ? builders.split(':') : [player.name];

                

                this.workShops[mapName.replace(' ', '_')] = {
                    id: mapName.replace(' ', '_'),
                    title: mapName,
                    key : this.workShops[sourceMapName.replace(' ', '_')].key,
                    owner: player.name,
                    builders: [builders],
                    privacy: !privacyToggle,
                    passcode: passcode,
                    developmentaState : 'unreleased',
                    mapVersion : '0.1',
                    creationVersion : this.workShops[sourceMapName.replace(' ', '_')].creationVersion,
                    compatableGamemodes : ['training'],
                    archivePos : this.workShops[sourceMapName.replace(' ', '_')].archivePos
                }
                uploadMapData(this.workShops[mapName.replace(' ', '_')]);

                if (mapName !== sourceMapName) {

                    this.workShops[sourceMapName] = null;
                    world.setDynamicProperty(sourceMapName.replace(' ', '_'),undefined)
                    let mapList = JSON.parse(world.getDynamicProperty('mapList'))
                    delete mapList[sourceMapName]
                    world.setDynamicProperty('mapList',JSON.stringify(mapList))
                }

            }
            else if (purpose === 'newMap') {

               this.vacantWorkshops = JSON.parse(world.getDynamicProperty('vacantWorkshops'))
            let [mapName, mapSize, passcode, privacyToggle,builders] = r.formValues
            mapSize = [`100x 100y 100z`,`200x 200y 200z`][mapSize]
                
            mapName = mapName || `${player.name}'s map`;
            builders = builders ? builders.split(':') : [player.name];


            if (this.workShops[mapName]) {
                    
                console.warn('prexsisting map name')
                return;
                }

                else if (this.vacantWorkshops.length > 0) {
                    
                    const targetKey = this.vacantWorkshops[0].key
                    const targetWorkshop = this.vacantWorkshops.shift()

                    world.setDynamicProperty('vacantWorkshops',JSON.stringify(this.vacantWorkshops))

                    this.workShops[mapName.replace(' ', '_')] = {
                        id: mapName.replace(' ', '_'),
                        title: mapName,
                        key : targetKey,
                        owner: player.name,
                        builders: [player.name],
                        privacy: !privacyToggle,
                        passcode: passcode,
                        developmentaState : 'unreleased',
                        mapVersion : '0.1',
                        creationVersion : '0.0.6',
                        compatableGamemodes : ['training'],
                        archivePos : targetWorkshop.archivePos
                    }
                    uploadMapData(this.workShops[mapName.replace(' ', '_')]);

                    this.activeWorkshops[player.name] = mapName;

                    let bounds = this.workShops[this.activeWorkshops[player.name]].archivePos;

             world.getPlayers({ name:player.name})[0].teleport({
                    x: bounds.northWest.x + (bounds.southEast.x - bounds.northWest.x) / 2, 
                    y: bounds.northWest.y + (bounds.southEast.y - bounds.northWest.y) / 2,
                    z: bounds.northWest.z + (bounds.southEast.z - bounds.northWest.z) / 2
                }) 

                }
                else if (this.vacantWorkshops.length < 1) {

                    const nextNWPos = JSON.parse(world.getDynamicProperty('nextNWPos'))

                    world.setDynamicProperty('nextNWPos',JSON.stringify({
                        x: nextNWPos.x,
                        y: nextNWPos.y,
                        z: nextNWPos.z + Number(mapSize.slice(Number(mapSize.indexOf('y'))+1,Number(mapSize.indexOf('z')))) + 100

                    }))

                    world.getPlayers({ name:player.name})[0].teleport({
                        x: nextNWPos.x + Number(mapSize.slice(0,Number(mapSize.indexOf('x')))) / 2, 
                        y: nextNWPos.y + Number(mapSize.slice(Number(mapSize.indexOf('x'))+1,Number(mapSize.indexOf('y')))) / 2,
                        z: nextNWPos.z + Number(mapSize.slice(Number(mapSize.indexOf('y'))+1,Number(mapSize.indexOf('z')))) / 2
                    }) 
                system.runTimeout(() => 
                    {
                        console.warn('test')
                        //world.getDimension("overworld").runCommandAsync('setblock 1000 1 1000 air')
                       // this.createSite({x:1000,y:0,z:1000},{x:1000,y:10,z:1000},'stone',20)=

                        this.workShops[mapName.replace(' ', '_')] = {
                            id: mapName.replace(' ', '_'),
                            title: mapName,
                            key : world.getDynamicProperty('highestWorkshopKey') + 1,
                            owner: player.name,
                            builders: [player.name],
                                privacy: !privacyToggle,
                                passcode: passcode,
                                developmentaState : 'unreleased',
                                mapVersion : '0.1',
                                creationVersion : '0.0.6',
                                compatableGamemodes : ['training'],
                                archivePos : { 
                                    northWest :{
                                        x: nextNWPos.x,
                                        y: nextNWPos.y,
                                        z: nextNWPos.z
                                    },
                                    southEast : {
                                        x: nextNWPos.x + Number(mapSize.slice(0,Number(mapSize.indexOf('x')))),
                                        y: nextNWPos.y + Number(mapSize.slice(Number(mapSize.indexOf('x'))+1,Number(mapSize.indexOf('y')))),
                                        z: nextNWPos.z + Number(mapSize.slice(Number(mapSize.indexOf('y'))+1,Number(mapSize.indexOf('z'))))
                                    }
                                }
                            }
                            uploadMapData(this.workShops[mapName.replace(' ', '_')])
                            console.warn('size: '+Number(mapSize.slice(0,Number(mapSize.indexOf('x')))) + '...' + Number(nextNWPos.x) + Number(mapSize.slice(0,Number(mapSize.indexOf('x')))))
                            console.warn()
                            this.activeWorkshops[player.name] = mapName;
                            console.warn(`NW.x: ${this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.x} SE.x: ${this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.x}` )
                            
                            world.setDynamicProperty('highestWorkshopKey',world.getDynamicProperty('highestWorkshopKey') + 1)
                           

                        
                            
                         },5)
                           
                            system.runTimeout(() => 
                                {
                                   world.getDimension("overworld").runCommandAsync(`setblock ${player.location.x} ${player.location.y -2} ${player.location.z} glass`)
                                    this.createSite(
                                        {
                                            x:this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.x,
                                            y:this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.y,
                                            z:this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.z
                                        },
                                        {
                                            x:this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.x,
                                            y:this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.y,
                                            z:this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.z
                                        },
                                        'aa:workshopborder',20)
                                },10)


            }
            setStation(player,'mapWorkshop')
            syncPlayerData(player.name,'session')
                    
                

        
                   

            }
            })
    },


    
    selectMap : function (player,purpose) {
        const [formBody, sourceList] = (purpose == 'design') 
            ? ["Select which map you wish to build on.", "BuildableMaps"] 
            : ["Select which map's metadata you wish to modify.", "OwnedMaps"];
       
        const form = new ActionFormData()
            .title("Build Form")
            .body(formBody)
            .button("§r---- §lNew Map §r----");
        
        this.formData[player.name] =  {};
        this.formData[player.name].mapSelection = JSON.parse(world.getDynamicProperty(player.name + sourceList))
        
        for (var i = 0; i < this.formData[player.name].mapSelection.length; i++) {
            form.button(this.formData[player.name].mapSelection[i])
        }

        this.formData[player.name].form = form;
        this.showForm(player,purpose)

    },

    modifyMap : function (player,map) {
        const form = new ModalFormData();
        form.textField(`Map Name`,`${player.name}'s Map`)
        form.dropdown(`Map Size`,[`100x 100y 100z`]);
        form.textField(`Passcode`,``)
        form.toggle(`Public?`);
        form.textField('Builders (names seperated by colons)',`${player.name}:username2`)
        form.title(`Ownership Form`)

        this.formData[player.name].form = form;
        this.showForm(player,'metadata',map)

    },

    showOwnershipForm : function (player) {



        const form = new ModalFormData();
        form.textField(`Map Name`,`${player.name}'s Map`)
        form.dropdown(`Map Size`,[`100x 100y 100z`]);
        form.textField(`Passcode`,``)
        form.toggle(`Public?`);
        form.textField('Builders (names seperated by colons)',`${player.name}:username2`)
        form.title(`Ownership Form`)

        form.show(player).then(r => {
            if (r.canceled) {
                if (r.cancelationReason === 'UserBusy') {
                    this.showOwnershipForm(player);
                }
                return;
            }

            this.vacantWorkshops = JSON.parse(world.getDynamicProperty('vacantWorkshops'))
            let [mapName, mapSize, passcode, privacyToggle,builders] = r.formValues
            mapSize = [`100x 100y 100z`,`200x 200y 200z`][mapSize]
                
            mapName = mapName || `${player.name}'s map`;
            builders = builders ? builders.split(':') : [player.name];


            if (this.workShops[mapName]) {
                    
                    setStation(player,'mapWorkshop')
                    this.activeWorkshops[player.name] = mapName;

                    let bounds = this.workShops[this.activeWorkshops[player.name]].archivePos;

                    world.getPlayers({ name:player.name})[0].teleport({
                    x: bounds.northWest.x + (bounds.southEast.x - bounds.northWest.x) / 2, 
                    y: bounds.northWest.y + (bounds.southEast.y - bounds.northWest.y) / 2,
                    z: bounds.northWest.z + (bounds.southEast.z - bounds.northWest.z) / 2
                }) 
                }

                else if (this.vacantWorkshops.length > 0) {
                    
                    const targetKey = this.vacantWorkshops[0].key
                    const targetWorkshop = this.vacantWorkshops.shift()

                    world.setDynamicProperty('vacantWorkshops',JSON.stringify(this.vacantWorkshops))

                    this.workShops[mapName.replace(' ', '_')] = {
                        id: mapName.replace(' ', '_'),
                        title: mapName,
                        key : targetKey,
                        owner: player.name,
                        builders: [player.name],
                        privacy: !privacyToggle,
                        passcode: passcode,
                        developmentaState : 'unreleased',
                        mapVersion : '0.1',
                        creationVersion : '0.0.6',
                        compatableGamemodes : ['training'],
                        archivePos : targetWorkshop.archivePos
                    }
                    uploadMapData(this.workShops[mapName.replace(' ', '_')]);

                    this.activeWorkshops[player.name] = mapName;

                    let bounds = this.workShops[this.activeWorkshops[player.name]].archivePos;

             world.getPlayers({ name:player.name})[0].teleport({
                    x: bounds.northWest.x + (bounds.southEast.x - bounds.northWest.x) / 2, 
                    y: bounds.northWest.y + (bounds.southEast.y - bounds.northWest.y) / 2,
                    z: bounds.northWest.z + (bounds.southEast.z - bounds.northWest.z) / 2
                }) 

                }
                else if (this.vacantWorkshops.length < 1) {

                    const nextNWPos = JSON.parse(world.getDynamicProperty('nextNWPos'))

                    world.setDynamicProperty('nextNWPos',JSON.stringify({
                        x: nextNWPos.x,
                        y: nextNWPos.y,
                        z: nextNWPos.z + Number(mapSize.slice(Number(mapSize.indexOf('y'))+1,Number(mapSize.indexOf('z')))) + 100

                    }))

                    world.getPlayers({ name:player.name})[0].teleport({
                        x: nextNWPos.x + Number(mapSize.slice(0,Number(mapSize.indexOf('x')))) / 2, 
                        y: nextNWPos.y + Number(mapSize.slice(Number(mapSize.indexOf('x'))+1,Number(mapSize.indexOf('y')))) / 2,
                        z: nextNWPos.z + Number(mapSize.slice(Number(mapSize.indexOf('y'))+1,Number(mapSize.indexOf('z')))) / 2
                    }) 
                system.runTimeout(() => 
                    {
                        console.warn('test')
                        //world.getDimension("overworld").runCommandAsync('setblock 1000 1 1000 air')
                       // this.createSite({x:1000,y:0,z:1000},{x:1000,y:10,z:1000},'stone',20)=

                        this.workShops[mapName.replace(' ', '_')] = {
                            id: mapName.replace(' ', '_'),
                            title: mapName,
                            key : world.getDynamicProperty('highestWorkshopKey') + 1,
                            owner: player.name,
                            builders: [player.name],
                                privacy: !privacyToggle,
                                passcode: passcode,
                                developmentaState : 'unreleased',
                                mapVersion : '0.1',
                                creationVersion : '0.0.6',
                                compatableGamemodes : ['training'],
                                archivePos : { 
                                    northWest :{
                                        x: nextNWPos.x,
                                        y: nextNWPos.y,
                                        z: nextNWPos.z
                                    },
                                    southEast : {
                                        x: nextNWPos.x + Number(mapSize.slice(0,Number(mapSize.indexOf('x')))),
                                        y: nextNWPos.y + Number(mapSize.slice(Number(mapSize.indexOf('x'))+1,Number(mapSize.indexOf('y')))),
                                        z: nextNWPos.z + Number(mapSize.slice(Number(mapSize.indexOf('y'))+1,Number(mapSize.indexOf('z'))))
                                    }
                                }
                            }
                            uploadMapData(this.workShops[mapName.replace(' ', '_')])
                            console.warn('size: '+Number(mapSize.slice(0,Number(mapSize.indexOf('x')))) + '...' + Number(nextNWPos.x) + Number(mapSize.slice(0,Number(mapSize.indexOf('x')))))
                            console.warn()
                            this.activeWorkshops[player.name] = mapName;
                            console.warn(`NW.x: ${this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.x} SE.x: ${this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.x}` )
                            
                            world.setDynamicProperty('highestWorkshopKey',world.getDynamicProperty('highestWorkshopKey') + 1)
                           

                        
                            
                         },5)
                           
                            system.runTimeout(() => 
                                {
                                   world.getDimension("overworld").runCommandAsync(`setblock ${player.location.x} ${player.location.y -2} ${player.location.z} glass`)
                                    this.createSite(
                                        {
                                            x:this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.x,
                                            y:this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.y,
                                            z:this.workShops[this.activeWorkshops[player.name]].archivePos.northWest.z
                                        },
                                        {
                                            x:this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.x,
                                            y:this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.y,
                                            z:this.workShops[this.activeWorkshops[player.name]].archivePos.southEast.z
                                        },
                                        'aa:workshopborder',20)
                                },10)


            }
            setStation(player,'mapWorkshop')
            syncPlayerData(player.name,'session')
                    
                

        }).catch((e) => {
            console.error(e, e.stack);
        });

    },

    designMap : function (player,mapName) {

        setStation(player,'mapWorkshop')
        this.activeWorkshops[player.name] = mapName;
        console.warn(JSON.stringify(this.activeWorkshops[player.name]))
        let bounds = this.workShops[this.activeWorkshops[player.name]].archivePos;

        world.getPlayers({ name:player.name})[0].teleport({
        x: bounds.northWest.x + (bounds.southEast.x - bounds.northWest.x) / 2, 
        y: bounds.northWest.y + (bounds.southEast.y - bounds.northWest.y) / 2,
        z: bounds.northWest.z + (bounds.southEast.z - bounds.northWest.z) / 2
                }) 

    },


    boundsCheck : function (pos,name) {

        let bounds = this.workShops[this.activeWorkshops[name]].archivePos;

        if (pos.x < bounds.northWest.x || pos.x > bounds.southEast.x || pos.y < bounds.northWest.y || pos.y > bounds.southEast.y || pos.z < bounds.northWest.z || pos.z > bounds.southEast.z) {
            //console.warn('\nbounds.northWest.x: ' + bounds.northWest.x +'\nbounds.northWest.y: ' + bounds.northWest.y + '\nbounds.northWest.z: ' + bounds.northWest.z +
            //'\n\nbounds.southEast.x: ' + bounds.southEast.x + '\nbounds.southEast.y: ' + bounds.southEast.y + '\nbounds.southEast.z: ' + bounds.southEast.z
            //)
        console.warn('Block outside of bounds')
        return true
    }
    else {
        console.warn('Block inside of bounds')
        return false
    }

    },

    enforceBounds : function (reason) {
        
        for (const playerName in this.activeWorkshops) {
            let pos = world.getPlayers({ name:playerName})[0].location;
            let bounds = this.workShops[this.activeWorkshops[playerName]].archivePos;
            
            if (pos.x < (bounds.northWest.x - 10) || pos.x > (bounds.southEast.x + 10) || pos.y < (bounds.northWest.y - 10) || pos.y > (bounds.southEast.y + 10) || pos.z < (bounds.northWest.z - 10) || pos.z > (bounds.southEast.z + 10)) {
                //console.warn('\nbounds.northWest.x: ' + bounds.northWest.x +'\nbounds.northWest.y: ' + bounds.northWest.y + '\nbounds.northWest.z: ' + bounds.northWest.z +
                //'\n\nbounds.southEast.x: ' + bounds.southEast.x + '\nbounds.southEast.y: ' + bounds.southEast.y + '\nbounds.southEast.z: ' + bounds.southEast.z
                //)
                system.run( () => {world.getPlayers({ name:playerName})[0].teleport({
                    x: bounds.northWest.x + (bounds.southEast.x - bounds.northWest.x) / 2, 
                    y: bounds.northWest.y + (bounds.southEast.y - bounds.northWest.y) / 2,
                    z: bounds.northWest.z + (bounds.southEast.z - bounds.northWest.z) / 2
            }) })
            
            console.warn(playerName + ' caught out of bounds. Call reason: ' + reason)
            return playerName
            }
            
            else {
                console.warn('bounds are fine. Call reason: ' + reason)
                return false;
            }
    }
    },

    createSite : function (northWestPoint,southEastPoint,blockId,chunkSize) {

        let chunkBuild = function (northWestPoint,southEastPoint,blockId,chunkSize) {

            chunkSize = Number(chunkSize)
            
            let chunkLength = {
                x : Math.floor((southEastPoint.x - northWestPoint.x) / chunkSize),
                y : Math.floor((southEastPoint.y - northWestPoint.y) / chunkSize),
                z : Math.floor((southEastPoint.z - northWestPoint.z) / chunkSize),
                xRemainder : (southEastPoint.x - northWestPoint.x) % chunkSize,
                yRemainder : (southEastPoint.y - northWestPoint.y) % chunkSize,
                zRemainder : (southEastPoint.z - northWestPoint.z) % chunkSize,
            }
            for (let xLoop =0; xLoop < chunkLength.x; xLoop++) {
                for(let yLoop = 0; yLoop < chunkLength.y; yLoop++){
                    for( let zLoop =0; zLoop < chunkLength.z; zLoop++){
                        taskManagement.newTask('c',JSON.stringify(
                        {
                            'taskId' : `fill`,
                            'northWestPos' : {
                                x : northWestPoint.x + chunkSize * xLoop,
                                y : northWestPoint.y + chunkSize * yLoop,
                                z : northWestPoint.z + chunkSize * zLoop
                            },
                            'southEastPos' : {
                                x : northWestPoint.x + (chunkSize * xLoop) + chunkSize,
                                y : northWestPoint.y + (chunkSize * yLoop) + chunkSize,
                                z : northWestPoint.z + (chunkSize * zLoop) + chunkSize
                            },
                            'blockId' : blockId
                        }
                        ))

                    }

                    if (chunkLength.zRemainder > 0 || (chunkLength.z < 1)) {
                        taskManagement.newTask('c',JSON.stringify(
                            {
                                'taskId' : `fill`,
                                'northWestPos' : {
                                    x : northWestPoint.x + chunkSize * xLoop,
                                    y : northWestPoint.y + chunkSize * yLoop,
                                    z : southEastPoint.z - chunkLength.zRemainder
                                },
                                'southEastPos' : {
                                    x : northWestPoint.x + (chunkSize * xLoop) + chunkSize,
                                    y : northWestPoint.y + (chunkSize * yLoop) + chunkSize,
                                    z : southEastPoint.z 
                                },
                                'blockId' : blockId
                            }
                        ))

                    }

                }

                if (chunkLength.yRemainder > 0 || (chunkLength.y < 1)) {
                for( let zLoop =0; zLoop < chunkLength.z; zLoop++){

                    taskManagement.newTask('c',JSON.stringify(
                        {
                            'taskId' : `fill`,
                            'northWestPos' : {
                                x : northWestPoint.x + chunkSize * xLoop,
                                y : southEastPoint.y - chunkLength.yRemainder,
                                z : northWestPoint.z + chunkSize * zLoop
                            },
                            'southEastPos' : {
                                x : northWestPoint.x + (chunkSize * xLoop) + chunkSize,
                                y : southEastPoint.y,
                                z : northWestPoint.z + (chunkSize * zLoop) + chunkSize
                            },
                            'blockId' : blockId
                        }
                    ))

                }

                if (chunkLength.zRemainder > 0 || (chunkLength.z < 1)) {
                    taskManagement.newTask('c',JSON.stringify(
                        {
                            'taskId' : `fill`,
                            'northWestPos' : {
                                x : northWestPoint.x + chunkSize * xLoop,
                                y : southEastPoint.y - chunkLength.yRemainder,
                                z : southEastPoint.z - chunkLength.zRemainder
                            },
                            'southEastPos' : {
                                x : northWestPoint.x + (chunkSize * xLoop) + chunkSize,
                                y : southEastPoint.y,
                                z : southEastPoint.z
                            },
                            'blockId' : blockId
                        }
                    ))

                }
                }
        }
            if (chunkLength.xRemainder > 0 || (chunkLength.x < 1)) {
                for(let yLoop = 0; yLoop < chunkLength.y; yLoop++){

                    for( let zLoop =0; zLoop < chunkLength.z; zLoop++){

                        taskManagement.newTask('c',JSON.stringify(
                        {
                            'taskId' : `fill`,
                            'northWestPos' : {
                                x : southEastPoint.x - chunkLength.xRemainder,
                                y : northWestPoint.y + chunkSize * yLoop,
                                z : northWestPoint.z + chunkSize * zLoop
                            },
                            'southEastPos' : {
                                x : southEastPoint.x,
                                y : northWestPoint.y + (chunkSize * yLoop) + chunkSize,
                                z : northWestPoint.z + (chunkSize * zLoop) + chunkSize
                            },
                            'blockId' : blockId
                        }
                        ))

                    }

                    if (chunkLength.zRemainder > 0 || (chunkLength.z < 1)) {

                        taskManagement.newTask('c',JSON.stringify(
                            {
                                'taskId' : `fill`,
                                'northWestPos' : {
                                    x : southEastPoint.x - chunkLength.xRemainder,
                                    y : northWestPoint.y + chunkSize * yLoop,
                                    z : southEastPoint.z - chunkLength.zRemainder
                                },
                                'southEastPos' : {
                                    x : southEastPoint.x,
                                    y : northWestPoint.y + (chunkSize * yLoop) + chunkSize,
                                    z : southEastPoint.z 
                                },
                                'blockId' : blockId
                            }
                        ))

                    }

                }

                if (chunkLength.yRemainder > 0 || (chunkLength.y < 1)) {
                    console.warn('debug')
                for( let zLoop =0; zLoop < chunkLength.z; zLoop++){

                    taskManagement.newTask('c',JSON.stringify(
                        {
                            'taskId' : `fill`,
                            'northWestPos' : {
                                x : southEastPoint.x - chunkLength.xRemainder,
                                y : southEastPoint.y - chunkLength.yRemainder,
                                z : northWestPoint.z + chunkSize * zLoop
                            },
                            'southEastPos' : {
                                x : southEastPoint.x,
                                y : southEastPoint.y,
                                z : northWestPoint.z + (chunkSize * zLoop) + chunkSize
                            },
                            'blockId' : blockId
                        }
                    ))

                }

                if (chunkLength.zRemainder > 0 || (chunkLength.z < 1)) {
                    taskManagement.newTask('c',JSON.stringify(
                        {
                            'taskId' : `fill`,
                            'northWestPos' : {
                                x : southEastPoint.x - chunkLength.xRemainder,
                                y : southEastPoint.y - chunkLength.yRemainder,
                                z : southEastPoint.z - chunkLength.zRemainder
                            },
                            'southEastPos' : {
                                x : southEastPoint.x,
                                y : southEastPoint.y,
                                z : southEastPoint.z
                            },
                            'blockId' : blockId
                        }
                    ))

                }
                }
            }

            
        }
        
        chunkBuild(
            {
                x : northWestPoint.x - 1,
                y : northWestPoint.y,
                z : northWestPoint.z
            },{
                x : northWestPoint.x - 1,
                y : southEastPoint.y,
                z : southEastPoint.z
            }, blockId, chunkSize
        )
        chunkBuild(
            {
                x : southEastPoint.x + 1,
                y : northWestPoint.y,
                z : northWestPoint.z
            },{
                x : southEastPoint.x + 1,
                y : southEastPoint.y,
                z : southEastPoint.z
            }, blockId, chunkSize
        )
        chunkBuild(
            {
                x : northWestPoint.x,
                y : northWestPoint.y - 1,
                z : northWestPoint.z
            },{
                x : southEastPoint.x,
                y : northWestPoint.y - 1,
                z : southEastPoint.z
            }, blockId, chunkSize
        )
        chunkBuild(
            {
                x : northWestPoint.x,
                y : southEastPoint.y + 1,
                z : northWestPoint.z
            },{
                x : southEastPoint.x ,
                y : southEastPoint.y + 1,
                z : southEastPoint.z
            }, blockId, chunkSize
        )
        chunkBuild(
            {
                x : northWestPoint.x,
                y : northWestPoint.y,
                z : northWestPoint.z - 1
            },{
                x : southEastPoint.x,
                y : southEastPoint.y,
                z : northWestPoint.z - 1
            }, blockId, chunkSize
        )
        chunkBuild(
            {
                x : northWestPoint.x,
                y : northWestPoint.y,
                z : southEastPoint.z + 1
            },{
                x : southEastPoint.x ,
                y : southEastPoint.y,
                z : southEastPoint.z +1
            }, blockId, chunkSize
        )
        
    },

}

let stations = {
    lobby : {players :[], switchCode : function (player) {
        if (player.name !== 'TornAlloy808450') world.getDimension("overworld").runCommandAsync(`gamemode a ${player.name}`)
        player.teleport({x:210, y: -58, z:100},{facingLocation: {x:200, y:-57,z:102}})

        player.getComponent('inventory').container.clearAll()
        let formItem = new ItemStack("aa:cosmeticform");
        formItem.lockMode = 'slot';
        formItem.keepOnDeath = true
        player.getComponent('inventory').container.setItem(0,formItem)
    }},

    trainingQueue : {players :[]},

    training : {players :[]},

    mapWorkshop : {players :[], switchCode : function (player) {
        player.getComponent('inventory').container.clearAll()
        world.getDimension("overworld").runCommandAsync(`gamemode c ${player.name}`)
    }}

}

function setStation(player,station) {
    stations[station].switchCode(player);
    stations[sessionPlayerData[player.name].station].players.splice(stations[sessionPlayerData[player.name].station].players.indexOf(player.name),1);
    sessionPlayerData[player.name].station = station;
    stations[station].players.push(player.name);
    console.warn(`\nCurrent session data station: §b${sessionPlayerData[player.name].station}§r\nTarget station array: §b${stations[station].players}§r`);
}
 
// operational
let roleReference = {
    0 : {
        badgeTitle : 'None',
        badgeColor : '§f',
        usableBadge : false
    },
    1 : {
        badgeTitle : 'Dev',
        badgeColor : '§c',
        usableBadge : true
    },
    2 : {
        badgeTitle : 'Console',
        badgeColor : '§7',
        usableBadge : true
    },
    3 : {
        badgeTitle : 'Pc',
        badgeColor : '§7',
        usableBadge : true
    }
};

// operational
let sessionPlayerData = {};

// operational
let startupPlayerData = {
    'TornAlloy808450' : {'nick' : 'Alloy',    'platform' : 'pc', 'roleCollection':[0,1]},
    'AheadEgg9655114' : {'nick' : 'Egg',      'platform' : 'console'},
    'FinestRaptor186' : {'nick' : 'Raptor',   'platform' : 'console'},
    'CrudeMovie24428' : {'nick' : 'Movie',    'platform' : 'console'},
    'OliverWolter'    : {'nick' : 'King O',   'platform' : 'console'},
    'UnhorsedOrc6404' : {'nick' : 'Orc',      'platform' : 'console'}
}

function uploadMapData (mapData) {
    let mapList = {}
    if (world.getDynamicProperty('mapList') !== undefined) {mapList = JSON.parse(world.getDynamicProperty('mapList'))}
    mapList[mapData.title] = mapData.id;
    world.setDynamicProperty('mapList', JSON.stringify(mapList));

    world.setDynamicProperty(mapData.id, JSON.stringify(mapData))
};

function downloadMapData (mapTitle) {
    let mapList = JSON.parse(world.getDynamicProperty('mapList'))
    let mapId = mapList[mapTitle]
    return JSON.parse(world.getDynamicProperty(mapId))
};

function syncPlayerData(playerName, originalData) {
    console.warn('Detecting type of data to sync from..')
    switch (originalData) { 
        case 'session' : 
            console.warn('Syncing data from \'session\' to \'dynamic\'..')
            world.setDynamicProperty(`${playerName}`, JSON.stringify(sessionPlayerData[playerName]));
            break;
        case 'dynamic' :
            console.warn('Syncing data from \'dynamic\' to \'session\'..')
            sessionPlayerData[playerName] = JSON.parse(world.getDynamicProperty(playerName)); 
            break;
    }
    console.warn('Data synced.')
}

function factoryResetPersonalSessionData(playerName) {

    console.warn(`Reseting personal data..`)

    sessionPlayerData[playerName] = {};
    Object.assign(sessionPlayerData[playerName], {'useNick' : false, 'badgeRoleId' : 0, 'nick' : '','prefix':'.', 'platform' : 'unknown','title':'','label':'','roleCollection':[0],'station':'lobby'});
    Object.assign(sessionPlayerData[playerName], startupPlayerData[playerName]);

    console.warn(`Personal data reset.`)
}

function assignPlayerLabel(player) {
    
    const playerData = sessionPlayerData[player.name];
    Object.assign(playerData, {'title' : playerData.useNick ? playerData.nick : player.name});

    if (playerData.badgeRoleId == 0) {
        Object.assign(playerData, {'label' : playerData.title})
    } else {
        Object.assign(playerData, {'label' : `${playerData.title} ${roleReference[playerData.badgeRoleId].badgeColor}[${roleReference[playerData.badgeRoleId].badgeTitle}]§r`})
    }
    //player.nameTag = playerData.label
    syncPlayerData(player.name,'session')
    world.getPlayers({ name:player.name})[0].nametag = playerData.label
}


world.afterEvents.playerSpawn.subscribe(eventData=> { 

    let { player, initialSpawn } = eventData;
    if(!initialSpawn) return;

    if (world.getDynamicProperty(player.name) === undefined) {

        console.warn(`Operation Join Dp detection.`)
        factoryResetPersonalSessionData(player.name)

    } else {

        syncPlayerData(player.name,'dynamic')

    }

    setStation(player,'lobby')
    assignPlayerLabel(player)
    syncPlayerData(player.name,'session')

    for (let channel in chatHandler.channels) {
        
        chatHandler.channels[channel].push(player.name)

    }

    let buildableMaps = [];
    let ownedMaps = [];
    for (const mapId in JSON.parse(world.getDynamicProperty(`mapList`))) {
        
        map = JSON.parse(world.getDynamicProperty(mapId))
        if (map.builders.includes(player.name)){
            buildableMaps.push(map.title)
            if (map.owner === player.name) ownedMaps.push(map.title)
        }
    }
world.setDynamicProperty(`${player.name}BuildableMaps`,JSON.stringify(buildableMaps))
world.setDynamicProperty(`${player.name}OwnedMaps`,JSON.stringify(ownedMaps))=

})

world.afterEvents.playerLeave.subscribe(eventData => {
        console.warn(eventData.playerName)
        // world.setDynamicProperty(`${eventData.playerName}`, JSON.stringify(sessionPlayerData[eventData.playerName]));
})

world.beforeEvents.chatSend.subscribe(eventData => {
    // block usual messaging from displaying.
    eventData.cancel = true;

    if (eventData.message.startsWith(sessionPlayerData[eventData.sender.name].prefix)) {
        const parsedCommand = commandHandler.parseChatMessage(sessionPlayerData[eventData.sender.name].prefix,eventData.message);
        if (parsedCommand) commandHandler.runCommand(eventData.sender, parsedCommand.keyword, parsedCommand.parameters)
    }
	else {
        // If the mesage does not begin with the command prefix, run.
        chatHandler.deliverMessage(eventData.sender.name,'global',eventData.message)
    }

});

world.afterEvents.itemUse.subscribe(eventData => {
    // Assign shortnames for better readability.
    const player = eventData.source;
    const playerData = sessionPlayerData[player.name];

    // Handle player cosmetics settings.
    if (eventData.itemStack.typeId === "aa:cosmeticform") {
        // Populate badge titles for dropdown.
        const badgeTitles = Object.keys(playerData.roleCollection).map(id => roleReference[id].badgeTitle);

        // Create and display the cosmetic settings form.
        new ModalFormData()
            .dropdown(`Active badge: ${roleReference[playerData.badgeRoleId].badgeTitle}`, badgeTitles)
            .textField("Nickname", playerData.nick)
            .toggle("Use Nickname", playerData.useNick)
            .title("Personal Cosmetic Settings")
            .show(player)
            .then(response => {
                if (response.canceled) return;

                // Update player data based on form submission.
                const [selectedBadgeIndex, nickname, useNickname] = response.formValues;
                playerData.badgeRoleId = Object.keys(playerData.roleCollection)[selectedBadgeIndex];
                if (nickname) playerData.nick = nickname;
                playerData.useNick = useNickname;

                assignPlayerLabel(player);
            })
            .catch(error => {
                console.error('Error displaying form:', error, error.stack);
            });
    } else if (eventData.itemStack.typeId === "minecraft:brick") {
        // Ensure the player is in the map workshop station before uploading map data.
        if (playerData.station !== 'mapWorkshop') return;
        
    }
});



world.afterEvents.playerInteractWithEntity.subscribe(({ player, target: { typeId } }) => {
    const [TRANSPORTER_NPC_TYPE, WORKSHOP_TRANSPORTER_TYPE, DIALOGUE_TAG, SUGGEST_BAIL_DIALOGUE, TRAINING_INVITE_DIALOGUE, WORKSHOP_INVITE_DIALOGUE] 
    = ['aa_0.0.4:transporternpc', 'aa:workshoptransporter', 'transportNpc.display', 'suggestBail', 'trainingInvite', 'workshopInvite'];

    const openDialogue = (playerName, dialogue) => world.getDimension("overworld").runCommandAsync(`execute as ${playerName} run dialogue open @e[tag=${DIALOGUE_TAG}] @s ${dialogue}`);

    const { name: playerName } = player;
    typeId === TRANSPORTER_NPC_TYPE 
        ? openDialogue(playerName, trainingHandler.queue.includes(playerName) ? SUGGEST_BAIL_DIALOGUE : TRAINING_INVITE_DIALOGUE)
        : typeId === WORKSHOP_TRANSPORTER_TYPE 
            ? openDialogue(playerName, WORKSHOP_INVITE_DIALOGUE)
            : console.warn(`Unhandled target type: ${typeId}`);
});



system.afterEvents.scriptEventReceive.subscribe(eventData => {
    console.warn(`Scriptevent feedback.\n§rSource Entity: §b${eventData.sourceEntity.name}\n§rId: §b${eventData.id}\n§rMessage: §b${eventData.message}`)
    switch (eventData.id) {

        case 'aa:training.joinQueue' : 
            trainingHandler.queueAddPlayer(eventData.sourceEntity); 
            console.warn(`\nQueue: ${trainingHandler.queue}\nAuction voters: ${trainingHandler.auctionVoters}\nKit Voters: ${trainingHandler.kitSelectionVoters}\n`)
            world.getDimension("overworld").runCommandAsync(`execute as ${eventData.sourceEntity.name} run dialogue open @e[tag=transportNpc.display] @s voteEquipment`);
            break;
        case 'aa:training.leaveQueue' :
            trainingHandler.queueRemovePlayer(eventData.sourceEntity); 
            console.warn(`\nQueue: ${trainingHandler.queue}\nAuction voters: ${trainingHandler.auctionVoters}\nKit Voters: ${trainingHandler.kitSelectionVoters}\n`)
            break;
        case 'aa:training.alterVote' :
            trainingHandler.removeVote(eventData.sourceEntity); 
            console.warn(`\nQueue: ${trainingHandler.queue}\nAuction voters: ${trainingHandler.auctionVoters}\nKit Voters: ${trainingHandler.kitSelectionVoters}\n`)
            world.getDimension("overworld").runCommandAsync(`execute as ${eventData.sourceEntity.name} run dialogue open @e[tag=transportNpc.display] @s voteEquipment`);
            break;
        case 'aa:training.submitVote' :
            trainingHandler.submitVote(eventData.sourceEntity, eventData.message);
            console.warn(`\nQueue: ${trainingHandler.queue}\nAuction voters: ${trainingHandler.auctionVoters}\nKit Voters: ${trainingHandler.kitSelectionVoters}\n`)
            break;
        case 'aa:workshop.build' :
            workshopManagementSystem.selectMap(eventData.sourceEntity,'design')
            break;
            case 'aa:workshop.modify' :
            workshopManagementSystem.selectMap(eventData.sourceEntity,'modify')
            break;
            case 'aa:workshop.beginDesign' :
            workshopManagementSystem.showOwnershipForm(world.getPlayers({name:eventData.sourceEntity.name})[0])
        

        
    }
    

});

world.beforeEvents.playerBreakBlock.subscribe(eventData => {

    if (sessionPlayerData[eventData.player.name].station == 'mapWorkshop' && workshopManagementSystem.boundsCheck(eventData.block.location,eventData.player.name) == true) {
        eventData.cancel = true;
        return;
    }
    switch (eventData.block.typeId) {
        case 'aa:workshopborder' :
            if (eventData.player.name == 'TornAlloy808450') {
                eventData.cancel = true;
                eventData.player.sendMessage(`[Script][Alerts]- §8You're unable to break borders.`)
            }
            break;

    }



})


world.afterEvents.playerPlaceBlock.subscribe(eventData => {
    console.warn('testing block at '+ eventData.block.location.x + ' ' + + eventData.block.location.y + ' ' + + eventData.block.location.z + '..')
    if (sessionPlayerData[eventData.player.name].station == 'mapWorkshop' && workshopManagementSystem.boundsCheck(eventData.block.location,eventData.player.name) == true) {
        world.getDimension('overworld').fillBlocks(eventData.block.location, eventData.block.location, "minecraft:air")
        console.warn('filled')
        return;
    }
})



// Secures data when reloading scripts
for(const player of world.getPlayers()){
    if (world.getDynamicProperty(player.name) === undefined) {

        factoryResetPersonalSessionData(player.name)
        assignPlayerLabel(player)
        syncPlayerData(player.name,'session')

    } else if (sessionPlayerData[player.name] != JSON.parse(world.getDynamicProperty(player.name))) {

        console.warn('Updating session player data to dynamic data.')
        syncPlayerData(player.name,'dynamic')

    }
    setStation(player,'lobby')

    for (let channel in chatHandler.channels) {
        
        chatHandler.channels[channel].push(player.name)

    }
};
//world.setDynamicProperty('mapList',JSON.stringify({"Alloy Station":"Alloy_Station","map2":"map2"}))



for(const [key,value] of Object.entries(JSON.parse(world.getDynamicProperty('mapList')))) {
    workshopManagementSystem.workShops[key] = JSON.parse(world.getDynamicProperty(value));
    
}

workshopManagementSystem.vacantWorkshops = JSON.parse(world.getDynamicProperty('vacantWorkshops'))

console.warn()

system.runInterval(() => {
    if (stations.mapWorkshop.players.length > 0) {

        workshopManagementSystem.enforceBounds('interval')
        
    }

   

    // for(const player of world.getPlayers()){}
},40)