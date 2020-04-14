export const isOpera =
	!!window.opr || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0

// Firefox 1.0+
export const isFirefox = typeof InstallTrigger !== 'undefined'

// Safari 3.0+ "[object HTMLElementConstructor]"
export const isSafari = /^((?!chrome|android).)*safari/i.test(
	navigator.userAgent
)

// Internet Explorer 6-11
export const isIE = /*@cc_on!@*/ false || !!document.documentMode

// Edge 20+
export const isEdge = !isIE && !!window.StyleMedia

// Chrome 1 - 79
export const isChrome =
	!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)

// Edge (based on chromium) detection
export const isEdgeChromium =
	isChrome && navigator.userAgent.indexOf('Edg') != -1

// Blink engine detection
export const isBlink = (isChrome || isOpera) && !!window.CSS
