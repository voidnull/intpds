// ==UserScript==
// @name Intpds-Naukri-Summary
// @namespace http://www.naukri.com
// @version 3.0
// @author Premkumar (contactprem@gmail.com)
// @include http://resdex.naukri.com/v2/search/searchResults*


function $() {
    if (arguments.length != 1) return ;
    if (typeof arguments[0] == 'string')
        return document.getElementById(arguments[0]);
    return arguments[0];
}

/**
 * Adds styles to the global CSS. From the Grease Monkey Book
 *
 */
function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function makeSummary() {
    /**
     * Strips Html Tags & returns just the content
     */

    function trim(s) {
        return s.replace(/^\s+|\s+$/, '');
    }

    function stripHtml(html) {
        html=html.replace(/N\/A/g,' ');
        html=html.replace(/<[^<>]*>/g,' ');
        html=html.replace(/&nbsp;/g,' ');
        html=html.replace(/\s+/g,' ');
        html=html.replace(/^\s+|\s+$/, '');
        return html;
    }

    function specificEmphasis(html) {
        html=html.replace(/Year\(s\)/gi,'y');
        html=html.replace(/Month\(s\)/gi,'m');
        html=html.replace(/Phone No/gi,'ph');
        html=html.toLowerCase();
        html=trim(html);
        var len=html.length;
        var pos=html.indexOf(":");

        //special cases BEGIN -------------------

        //for current location
        html=html.replace(/current location/,'location');

        //remove pref location
        if (0==html.indexOf("pref location")) {
            return "";
        }

        //remove verified..
        if (0==html.indexOf("ph")) {
            html=html.replace(/verified/gi,'');
        }

        //special cases END ---------------------



        if (pos>0) {
            var vallen=len-pos;
            console.log("pos:"+pos+ "  len:"+len+ "html=" +html);
            if (vallen > 2) {
                html='<span class=n> ' + html.replace(/ *: */,' </span><span class=v>: ') + ' </span>';
            }
            else {
                //if there is no value then dont add
                html="";
            }
        }
        else {
            //could be education
            html="<span class=v>" + html + "</span>";
        }
        return html;
    }

    function wait(msecs) {
        var cur = new Date().getTime();
        var end = cur + msecs;
        while(cur <end ) {
            cur = new Date().getTime();
        }
    }

    function getNode(xpath, parentNode) {
        return document.evaluate(xpath, parentNode, null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    }

    function addNameValue(name, value) {
        div+="<li>";
        div+="<span class='n'>" + trim(name) + "</span>: &nbsp;";
        div+="<span class='v'>" + trim(value) + "</span>";
        div+="</li>";
    }

    //fill the data
    //get all divs - iterator style
    var allcands,nodes,div;
    var count=0;
    var allhtml="";
    allhtml="";
    allhtml+= "<html><head><title>Candidate Summary</title>";
    allhtml+='<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/2.8.2r1/build/reset/reset-min.css">';
    allhtml+= "<style>" ;
    //"* {font-family: Verdana, Tahoma, Helvetica, Arial;}" +
    allhtml+="* {font-family: Arial, Helvetica, sans-serif;}" +
        "*.cand {display:block;padding:3px;border:1px solid #95B3D7;margin:8px;} \n" +
        "*.candinfo {margin-bottom:25px;} \n" +
        "*.hdr  {text-align:center;margin-bottom:10px;font-weight:bold;} \n" +
        "*.ftr  {text-align:center;margin-top:10px;} \n" +
        "span.n {font-style:italic;font-size:0.75em;text-transform:capitalize;margin:1px 0px;padding:0px;float:left;width:50px;} \n" +
        "span.v {font-weight:bold;font-size:0.75em;margin:1px 0px;text-transform:capitalize;padding:0px;} \n" +
        "hr.line {border: 1px solid #000;;}";
    allhtml+="</style></head><body>";
    allhtml+="<div class='cand hdr'>";
    allhtml+="Candidates</div><hr class=line/>";
    allcands = getNode("//div[@id='tupCont']/div[@class='tuple']", document.documentElement);
    console.log('num candidates:' + allcands.snapshotLength);
    if (allcands){
        var i,j, checked;
        var len=allcands.snapshotLength;
        
        //just click the phone ...
        for (i = 0; i < len; i++) {
            checked = false;
            candidate=allcands.snapshotItem(i);
            checkbox=getNode(".//a[contains(@class,'userChk')]/input[@type='checkbox']", candidate);
            if (checkbox.snapshotLength>=1) checked = (1 == checkbox.snapshotItem(0).value || checkbox.snapshotItem(0).checked)
            console.log((1 == checkbox.snapshotItem(0).value || checkbox.snapshotItem(0).checked));
            console.log(checked)

            phone = getNode(".//a[@class='tel']", candidate);
            if (phone.snapshotLength>=1 &&  checked) {
                phone.snapshotItem(0).click();
                console.log("clicked on " + phone.snapshotItem(0));
            }
        }

        //DO IT AGAIN - so that we can pick up the new phone numbers.
        allcands = getNode("//div[@id='tupCont']/div[@class='tuple']", document.documentElement);

        for (i=0; i < len; i++) {
            candidate=allcands.snapshotItem(i);
            checked=false;
            checkbox=getNode(".//a[contains(@class,'userChk')]/input[@type='checkbox']", candidate);

            if (checkbox.snapshotLength>=1) {
                console.log(1 == checkbox.snapshotItem(0).value)
                checked = (1 == checkbox.snapshotItem(0).value || checkbox.snapshotItem(0).checked);
            
                console.log((1 == checkbox.snapshotItem(0).value || checkbox.snapshotItem(0).checked));
                console.log(checked)
            }

            if (checked) {
                count++;
                div="<div class='cand candinfo'><ul>";

                //name
                value="";
                nodes = getNode(".//a[contains(@class,'name') and contains(@class,'fl')]", candidate);
                if (nodes.snapshotLength>=1) value=stripHtml(nodes.snapshotItem(0).innerHTML);
                addNameValue('name', value);

                //title
                value="";
                nodes = getNode(".//div[@class='tupLeft']/label[text()='Current']/following-sibling::div[1]", candidate);
                if (nodes.snapshotLength>=1) value=stripHtml(nodes.snapshotItem(0).innerHTML);
                //addNameValue('Title', value);

                //location
                value="";
                nodes = getNode(".//div[@class='tupLeft']/label[contains(text(),'Location')]/following-sibling::div[1]", candidate);
                if (nodes.snapshotLength>=1) value=stripHtml(nodes.snapshotItem(0).innerHTML);
                addNameValue('Location', value);

                //phone
                nodes = getNode(".//a[contains(@class,'tel')]/span[@class='txt']", candidate);
                if (nodes.snapshotLength>=1) value=stripHtml(nodes.snapshotItem(0).innerHTML);
                addNameValue('Phone', value);

                div+="</ul></div>";

                allhtml+=div;
                //allhtml+="<hr class=line/>";
            }
            else {
                console.log("candidate : " + i + " : has not been selected ..");
            }
            console.log('done processing:' + i + ' of ' + len);
        }

    }
    else {
        allhtml+="<div class=cand><b>unable to retrieve data..<b></div>";
    }
    //console.log(allhtml);
    //allhtml+="<div class='cand ftr'>";
    //allhtml+="<a href='javascript:void(0);' onclick=\"document.getElementById('sumdiv').style.display='none';\">";
    //allhtml+="Close window [X]</a></div>";
    allhtml+="</body></html>";
    if (count>0) {
        sumwin = window.open('','Candidate Summary','width=500,height=500,resizable=1,scrollbars=1,location=0');
        sumwin.document.write(allhtml);
        //document.getElementById('sumdiv').innerHTML = allhtml;
        //document.getElementById('sumdiv').style.display='block';
    }
    else {
        alert("No candidates selected..");
    }

    //for debugging..
    return allhtml;
}

//insert summary button
function insertButton() {
    var ul;

    ul=document.evaluate("//div[@class='clFx exploreLinkCont']",document.documentElement, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if (ul.snapshotLength>0) {
        var newDiv = document.createElement('div');
        newDiv.setAttribute("id","isum");
        newDiv.innerHTML = "<button id='aisum' onclick='makeSummary();'>Summary</button>";
        ul.snapshotItem(0).parentNode.insertBefore(newDiv, ul.snapshotItem(0).nextSibling);

        //$('aisum').addEventListener("click", makeSummary, true);
        
	addGlobalStyle("#aisum {position: fixed; top: 80px; left: 00px; background-color: #0053CC; color: white; font-size: 1.3em; border-color: #0053BC;cursor: pointer;}");

    }
    var sumdiv = document.createElement('div');
    sumdiv.setAttribute("id","sumdiv");
    sumdiv.innerHTML="Summary will be displayed here";
    (document.body || document.head || document.documentElement).appendChild(sumdiv);

    return true;
}

function closureSummary() {
    log("closureSummary called..2");

    //return makeSummary;
}

function addSummary() {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode(''+ makeSummary +''));
    (document.body || document.head || document.documentElement).appendChild(script);
}

//----------MAIN-----------
addSummary();
insertButton();
