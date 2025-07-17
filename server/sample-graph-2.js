// sample graph data
const sampleGraph =
{
    graph_name:"Sample Graph",
    rootId: "knowable",
    elements: [
        // knowable-card
        {isa:"panel",id:"knowable-card",kind:"card",name:"knowable home card",
            description: "Knowable home card.",
            content: ""
        },
        {isa:"link",kind:"child-card",from:"knowable-card",to:"proj-browse-card",lable:"Directory Browser",description:"Browse your project files."},
        {isa:"link",kind:"child-card",from:"knowable-card",to:"word-cloud-card",lable:"Word Cloud",description:"Explore nested word clouds."},
        {isa:"link",kind:"child-card",from:"knowable-card",to:"calc-card",lable:"Calc",description:"Calculator."},

        // proj-browse-card
        {isa:"panel",id:"proj-browse-card",kind:"card",name:"project browser home card",
            description: "Project browser home card.",
            content: `<pre style='text-align:left;'># Knowable - Graph Explorer

A visual graph explorer.

## Architecture

- **Backend**: Node.js + Express + WebSocket (Railway deployment)
- **Frontend**: Static HTML/JS (GitHub Pages)
- **Communication**: WebSocket-first with real-time bidirectional messaging
- **Philosophy**: Server-driven architecture with client as "display device"
</pre>`
        },
        {isa:"link",kind:"parent-card",from:"proj-browse-card",to:"knowable-card",lable:"Knowable Home",description:"Knowable page root."},
        {isa:"link",kind:"directory",from:"proj-browse-card",to:"knowable",lable:"Browse Project Files",description:"Browse your project files."},

        // word-cloud-card
        {isa:"panel",id:"word-cloud-card",kind:"card",name:"word cloud home card",
            description: "Word cloud home card.",
            content: ""
        },
        {isa:"link",kind:"parent-card",from:"word-cloud-card",to:"knowable-card",lable:"Knowable Home",description:"Knowable page root."},

        // calc-card
        {isa:"panel",id:"calc-card",kind:"card",name:"calc home card",
            description: "Calc home card.",
            content: ""
        },
        {isa:"link",kind:"parent-card",from:"calc-card",to:"knowable-card",lable:"Knowable Home",description:"Knowable page root."},




        {isa:"panel",id:"knowable",kind:"directory",name:"knowable directory",
            description: "Knowable project root.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"knowable",to:"client",loc:"inside-lower-right"},
        {isa:"link",kind:"sub-directory",from:"knowable",to:"server",loc:"inside-lower-right"},
        {isa:"link",kind:"sub-directory",from:"knowable",to:"services",loc:"inside-lower-right"},
        {isa:"link",kind:"sub-directory",from:"knowable",to:"test",loc:"inside-lower-right"},
        {isa:"link",kind:"parent-card",from:"knowable",to:"proj-browse-card",lable:"Home Card",description:"Project card."},

        {isa:"panel",id:"client",kind:"directory",name:"client directory",
            description: "Static HTML and Javascript for web client.",
            content: ""
        },
        {isa:"link",kind:"parent-directory",from:"client",to:"knowable",loc:"outside-left-upper"},

        {isa:"panel",id:"server",kind:"directory", name:"server directory",
            description: "Node.js backend server root.",
            content: ""
        },
        {isa:"link",kind:"parent-directory",from:"server",to:"knowable",loc:"outside-left-upper"},

        {isa:"panel",id:"services",kind:"directory",name:"services directory",
            description: "Scripts and resources for systemd.",
            content: ""
        },
        {isa:"link",kind:"sub-directory",from:"services",to:"scripts",loc:"inside-lower-right"},
        {isa:"link",kind:"sub-directory",from:"services",to:"systemd",loc:"inside-lower-right"},
        {isa:"link",kind:"parent-directory",from:"services",to:"knowable",loc:"outside-left-upper"},

        {isa:"panel",id:"scripts",kind:"directory",name:"scripts directory",
            description: "Systemd service management scripts.",
            content: ""
        },
        {isa:"link",kind:"parent-directory",from:"scripts",to:"services",loc:"outside-left-upper"},

        {isa:"panel",id:"systemd",kind:"directory",name:"systemd directory",
            description: "Systemd .service files.",
            content: ""
        },
        {isa:"link",kind:"parent-directory",from:"systemd",to:"services",loc:"outside-left-upper"},

        {isa:"panel",id:"test",kind:"directory",name:"test directory",
            description: "Node.js testing server.",
            content: "Runs acceptance tests against the backend service."
        },
        {isa:"link",kind:"parent-directory",from:"test",to:"knowable",loc:"outside-left-upper"},
    ]
}

function getLink(from, kind) {
    return sampleGraph.elements.find(e => e.isa === 'link' && e.from === from && e.kind === kind);
}

function getLinks(from, kind) {
    return sampleGraph.elements.filter(e => e.isa === 'link' && e.from === from && e.kind === kind);
}

function getPanel(id) {
    return sampleGraph.elements.find(e => e.isa === 'panel' && e.id === id);
}

function getRoot() {
    return getPanel(sampleGraph.rootId);
}

module.exports = {
    rootId: sampleGraph.rootId,
    getPanel: getPanel,
    getLink: getLink,
    getLinks: getLinks,
    getRoot: getRoot
};