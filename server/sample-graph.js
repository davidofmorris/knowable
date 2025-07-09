// sample graph data
const sampleGraph =
{
    graph_name:"Sample Graph",
    root: "knowable",
    elements: [
        {isa:"panel",id:"knowable",kind:"directory",name:"knowable directory",
            description: "Knowable project root.",
            content: ""
        },
        {isa:"panel",id:"client",kind:"directory",name:"client directory",
            description: "Static HTML and Javascript for web client.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"knowable",to:"client",loc:"inside,right"},
        {isa:"link",kind:"parent-directory",from:"client",to:"knowable",loc:"outside,left"},

        {isa:"panel",id:"server",kind:"directory", name:"server directory",
            description: "Node.js backend server root.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"knowable",to:"server",loc:"inside,right"},
        {isa:"link",kind:"parent-directory",from:"server",to:"knowable",loc:"outside,left"},

        {isa:"panel",id:"services",kind:"directory",name:"services directory",
            description: "Scripts and resources for systemd.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"knowable",to:"services",loc:"inside,right"},
        {isa:"link",kind:"parent-directory",from:"services",to:"knowable",loc:"outside,left"},

        {isa:"panel",id:"scripts",kind:"directory",name:"scripts directory",
            description: "Systemd service management scripts.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"services",to:"scripts",loc:"inside,right"},
        {isa:"link",kind:"parent-directory",from:"scripts",to:"services",loc:"outside,left"},

        {isa:"panel",id:"systemd",kind:"directory",name:"systemd directory",
            description: "Systemd .service files.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"services",to:"systemd",loc:"inside,right"},
        {isa:"link",kind:"parent-directory",from:"systemd",to:"services",loc:"outside,left"},

        {isa:"panel",id:"test",kind:"directory",name:"test directory",
            description: "Node.js testing server.",
            content: "Runs acceptance tests against the backend service."
        },
        {isa:"link",kind:"sub-directory",from:"knowable",to:"test",loc:"inside,right"},
        {isa:"link",kind:"parent-directory",from:"test",to:"knowable",loc:"outside,left"},
    ]
}

function getRoot() {
    const rootId = sampleGraph.root;
    const rootElement = sampleGraph.elements.find(e => e.isa === 'panel' && e.id === rootId);
    return rootElement;
}

function getLinks(p) {
    return sampleGraph.elements.filter(e => e.isa === 'link' && e.from === p.id);
}

function getPanel(id) {
    return sampleGraph.elements.find(e => e.isa === 'panel' && e.id === id);
}

module.exports = {
    root: getRoot(),
    getLinks: getLinks,
    getPanel: getPanel
};