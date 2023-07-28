import React,{useEffect} from "react";

const SpeechToText = () => {

    const HilightRegion = (para, start, end, isRed, idz) => {

        var pNode = document.getElementById('cert-editor').childNodes[para];
        var currentNode = pNode.childNodes[0]
        var initialLen = currentNode.textContent.length

        var i = 1;
        while(end > initialLen && pNode.childNodes[i])
        {
            currentNode = pNode.childNodes[i]
            
            initialLen += currentNode.textContent.length    
            i++
        }

        var text = currentNode.textContent
        var textNodeStart = document.createTextNode(text.substring(0, start - (initialLen -text.length)))
        var textNodeEnd = document.createTextNode(text.substring(end - (initialLen -text.length), text.length))
        var spanNode = document.createElement("SPAN")
        spanNode.id = idz
        // spanNode.addEventListener("click", SpanClick)
        spanNode.textContent = text.substring(start - (initialLen -text.length), end - (initialLen -text.length))

        if(isRed)
        {
            spanNode.style.borderBottom = "3px solid #ff99ab"
        }
        else 
        {
            spanNode.style.borderBottom = "3px solid rgba(0,161,255,.57)"
        }


        currentNode.replaceWith(textNodeStart)
        textNodeStart.parentNode.insertBefore(spanNode, textNodeStart.nextSibling)
        spanNode.parentNode.insertBefore(textNodeEnd, spanNode.nextSibling)

    }

    const convertSpanToTextNode = (Node) => {

        if(Node.nodeName === "SPAN")
        {
            if(Node.previousSibling === null){

                if(Node.nextSibling === null)
                {
                    var textNode = document.createTextNode(Node.textContent)
                    Node.parentNode.replaceWith(textNode)
                    return Node.parentNode

                }
                else 
                {
                    Node.nextSibling.textContent = Node.textContent + Node.nextSibling.textContent
                    return Node.nextSibling

                }
            }
            else
            {
                Node.previousSibling.textContent += Node.textContent
                if(Node.nextSibling !== "SPAN")
                {
                    Node.previousSibling.textContent += Node.nextSibling.textContent
                    Node.nextSibling.remove()
                }
                var prevSib = Node.previousSibling
                Node.remove()
                return prevSib

                // return Node.previousSibling.textContent.length
            }

        }
    }

    useEffect(()=>{
        HilightRegion(0,30, 34, true, "0")
        HilightRegion(0,35, 39, true, "1")

    },[])


    return (
        <div id="cert-editor" className="cert-editor" spellCheck="false" suppressContentEditableWarning={true}>
            {/* <p>&nbsp;</p> */}
            <p>People Love to comment on the self-made businessman. The person who has come up the hard way. </p>
        </div>
    )

}

export default SpeechToText