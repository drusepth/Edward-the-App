(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{"+XSZ":function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.chaptersToPdf=void 0;var o=s(n("hhQR")),i=s(n("m1cH")),r=s(n("FyfS")),u=s(n("4d7F")),a=s(n("5JmO")),c=s(n("TruH")),l=s(n("JEAp"));function s(t){return t&&t.__esModule?t:{default:t}}a.default.vfs=c.default.pdfMake.vfs;e.chaptersToPdf=function(t,e){return new u.default(function(n){var u,c={content:[{text:t,style:"title"}],styles:{body:{fontSize:12},bold:{bold:!0},blockquote:{margin:[10,10,0,10]},chapterHeading:{fontSize:20,margin:[5,10]},h1:{fontSize:18},h2:{fontSize:16},h3:{fontSize:14},italic:{italics:!0},strike:{decoration:"lineThrough"},title:{fontSize:40},underline:{decoration:"underline"}}},s=[];function d(t,e){return{text:t||"",style:e||[]}}var p=!0,h=!1,v=void 0;try{for(var m,g=(0,r.default)(e);!(p=(m=g.next()).done);p=!0){var x=m.value;s.push({text:x.title,style:"chapterHeading",pageBreak:"before"});var _={text:[],style:[]},b=x.content&&x.content.ops||[],y=!0,w=!1,k=void 0;try{for(var T,A=(0,r.default)(b);!(y=(T=A.next()).done);y=!0){var C,P=T.value,S=P.insert,E=f(P.attributes),D=E.styles,F=E.lineStyles;if(F.length)(C=_.style).push.apply(C,(0,i.default)(F));if("\n"!==S)if(S.includes("\n")){var I=S.split("\n"),M=(0,o.default)(I),J=M[0],O=M.slice(1);if(J){var j=d(J,D);_.text.push(j)}s.push(_),_={text:[],style:[]};for(var B=0;B<O.length-1;B++){var $=d(O[B],D);_.text.push($),s.push(_),_={text:[],style:[]}}var L=d(O[O.length-1],D);_.text.push(L)}else{var N=d(S,D);_.text.push(N)}else s.push(_),_={text:[],style:[]}}}catch(t){w=!0,k=t}finally{try{!y&&A.return&&A.return()}finally{if(w)throw k}}}}catch(t){h=!0,v=t}finally{try{!p&&g.return&&g.return()}finally{if(h)throw v}}var G=1;s.forEach(function(t){return t.style.includes("ul")?(t.ul=[{text:t.text}],G=1,t.text=null):t.style.includes("ol")?(t.ol=[{text:t.text}],t.start=G++,t.text=null):G=1,t}),c.content=(u=c.content).concat.apply(u,s),a.default.createPdf(c).getBlob(function(e){if(window&&window._integration)return window._pdfSuccess=!0,n();l.default.saveAs(e,t+".pdf"),n()})})};var d={bullet:"ul",ordered:"ol"};function f(t){var e=[],n=[];if(!t)return{styles:e,lineStyles:n};for(var o in t)["bold","italic","underline","strike"].includes(o)?e.push(o):"header"!==o?"blockquote"!==o?"list"!==o||n.push(d[t[o]]):n.push("blockquote"):n.push("h"+t[o]);return{styles:e,lineStyles:n}}},Kuy8:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=h(n("m1cH")),i=h(n("GQeE")),r=n("aS18"),u=n("fyQS"),a=n("+XSZ"),c=n("j9tD"),l=h(n("il2d")),s=h(n("xweI")),d=n("UUVB"),f=h(n("GUC0")),p=h(n("bFnm"));function h(t){return t&&t.__esModule?t:{default:t}}e.default={components:{PulseLoader:l.default},computed:{allChapters:function(){return this.$store.state.chapters.chapters},allPlans:function(){return this.$store.state.chapters.plans},allTopics:function(){return this.$store.state.chapters.topics},allWorkshops:function(){return this.$store.state.workshop.workshops},documentGuid:function(){return this.$store.state.document.currentDocument.guid},documentTitle:function(){return this.$store.state.document.currentDocument.name},isPremium:function(){return this.$store.state.user.user.isPremium},masterTopics:function(){return this.$store.state.chapters.topics}},data:function(){return{includeArchived:!1,loading:!1}},methods:{importBackup:function(t){var e=this;this.loading=!0;var n=void 0;(0,r.jsonFileToBackup)(t).then(function(t){return(n=t).guid=e.documentGuid,n.name=e.documentTitle,d.storageApiPromise.then(function(t){return t.docImport(n)})}).then(function(t){e.loading=!1,(0,u.resetCache)(),(0,f.default)({icon:"success",text:"The document has been imported.",title:"Success"}).then(function(){return e.$store.dispatch(c.CHANGE_DOCUMENT,{guid:e.documentGuid,name:e.documentTitle})})},function(t){throw e.loading=!1,(0,f.default)({icon:"error",text:'Could not import the document. DETAILS: "'+t+'"',title:"Failure"}),t})},exportJsonDocument:function(){var t=this;this.loading=!0,d.storageApiPromise.then(function(e){return e.docExport(t.documentGuid,t.documentTitle)}).then(function(e){(0,r.backupToJsonFile)(t.documentTitle,e).then(function(){t.loading=!1},function(e){throw t.loading=!1,(0,f.default)({icon:"error",text:'Could not export the document. DETAILS: "'+e+'"'}),e})},function(e){throw t.loading=!1,(0,f.default)({icon:"error",text:'Could not export the document. DETAILS: "'+e+'"'}),e})},exportPdfChapters:function(){var t=this;this.loading=!0;var e=this.allChapters.filter(function(e){return!e.archived||t.includeArchived});(0,a.chaptersToPdf)(this.documentTitle,e).then(function(){t.loading=!1},function(e){throw t.loading=!1,(0,f.default)({icon:"error",text:'Could not export the document. DETAILS: "'+e+'"'}),e})},exportPdfOutlines:function(){var t,e=this;this.loading=!0;var n=this.allChapters.filter(function(t){return!t.archived||e.includeArchived}).map(function(t){return(0,i.default)(t.topics).map(function(n){var o=t.topics[n],i=e.getMasterTopic(o);return o.archived=i.archived,o.title=t.title+" - "+i.title,o}).filter(function(t){return!t.archived||e.includeArchived})}),r=(t=[]).concat.apply(t,(0,o.default)(n));(0,a.chaptersToPdf)(this.documentTitle+": Outlines",r).then(function(){e.loading=!1},function(t){throw e.loading=!1,(0,f.default)({icon:"error",text:'Could not export outlines. DETAILS: "'+t+'"'}),t})},exportPdfPlans:function(){var t,e=this;this.loading=!0;var n=this.allPlans.filter(function(t){return!t.archived||e.includeArchived}).map(function(t){return t.sections.filter(function(t){return!t.archived||e.includeArchived}).map(function(e){return{title:t.title===e.title?t.title:t.title+" - "+e.title,content:e.content}})}),i=(t=[]).concat.apply(t,(0,o.default)(n));(0,a.chaptersToPdf)(this.documentTitle+": Plans",i).then(function(){e.loading=!1},function(t){throw e.loading=!1,(0,f.default)({icon:"error",text:'Could not export plans. DETAILS: "'+t+'"'}),t})},exportPdfWorkshops:function(){var t=this;this.loading=!0;var e=this.allWorkshops.filter(function(e){return!e.archived||t.includeArchived}).map(function(t){return{content:t.content,date:t.date,guid:t.guid,order:t.order,title:p.default[t.workshopName].displayName+" ("+t.date.toString()+")",workshopName:t.workshopName}}),n=(0,s.default)(e,function(t){return t.workshopName+"-"+t.date.toString()+"-"+t.guid+"-"+t.order});(0,a.chaptersToPdf)(this.documentTitle+": Workshops",n).then(function(){t.loading=!1},function(e){throw t.loading=!1,(0,f.default)({icon:"error",text:'Could not export workshops. DETAILS: "'+e+'"'}),e})},getMasterTopic:function(t){return this.masterTopics.find(function(e){return e.guid===t.guid})},setFile:function(t){var e=this;(0,f.default)({buttons:!0,dangerMode:!0,icon:"warning",text:"Are you sure you want to import this file? It will overwrite everything in the current document.",title:"Overwrite current document?"}).then(function(n){n&&e.importBackup(t.target.files[0])})}}}},O9dL:function(t,e,n){"use strict";n.r(e);var o=n("Kuy8"),i=n.n(o);for(var r in o)"default"!==r&&function(t){n.d(e,t,function(){return o[t]})}(r);var u=n("U8Te"),a=n("JFUb");var c=function(t){n("SRBC")},l=Object(a.a)(i.a,u.a,u.b,!1,c,"data-v-6073a70b",null);e.default=l.exports},SRBC:function(t,e){},U8Te:function(t,e,n){"use strict";n.d(e,"a",function(){return o}),n.d(e,"b",function(){return i});var o=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"wrap"},[n("div",{staticClass:"exporter"},[n("div",{staticClass:"export-option"},[n("h3",[t._v("Export to PDF")]),t._v(" "),n("div",[t._v("(You can open PDFs in Microsoft Word.)")]),t._v(" "),t.loading?n("pulse-loader"):t._e(),t._v(" "),n("div",{staticClass:"export-checkbox"},[t.loading?t._e():n("input",{directives:[{name:"model",rawName:"v-model",value:t.includeArchived,expression:"includeArchived"}],attrs:{id:"includeArchived",type:"checkbox"},domProps:{checked:Array.isArray(t.includeArchived)?t._i(t.includeArchived,null)>-1:t.includeArchived},on:{change:function(e){var n=t.includeArchived,o=e.target,i=!!o.checked;if(Array.isArray(n)){var r=t._i(n,null);o.checked?r<0&&(t.includeArchived=n.concat([null])):r>-1&&(t.includeArchived=n.slice(0,r).concat(n.slice(r+1)))}else t.includeArchived=i}}}),t._v(" "),t.loading?t._e():n("label",{attrs:{for:"includeArchived"}},[t._v("Include Archived")])]),t._v(" "),t.loading?t._e():[n("button",{staticClass:"button-green export-button",on:{click:function(e){t.exportPdfChapters()}}},[t._v("\n          Export all chapters\n        ")]),t._v(" "),n("button",{staticClass:"button-green export-button",on:{click:function(e){t.exportPdfPlans()}}},[t._v("\n          Export all plans\n        ")]),t._v(" "),n("button",{staticClass:"button-green export-button",on:{click:function(e){t.exportPdfOutlines()}}},[t._v("\n          Export all outlines\n        ")]),t._v(" "),t.isPremium?n("button",{staticClass:"button-green export-button",on:{click:function(e){t.exportPdfWorkshops()}}},[t._v("\n          Export all workshops\n        ")]):t._e()]],2),t._v(" "),n("div",{staticClass:"export-option"},[n("h3",[t._v("Create a backup")]),t._v(" "),n("div",[t._v("(You can recover your document from this file later.)")]),t._v(" "),t.loading?n("pulse-loader"):t._e(),t._v(" "),t.loading?t._e():n("button",{staticClass:"button-green export-button",on:{click:function(e){t.exportJsonDocument()}}},[t._v("\n        Export entire document\n      ")])],1),t._v(" "),n("div",{staticClass:"export-option"},[n("h3",[t._v("Import a backup")]),t._v(" "),n("div",[t._v("\n        (Warning: This will overwrite the current document completely, including all chapters, plans and outlines.)\n      ")]),t._v(" "),n("div",{staticClass:"file-input-container"},[t.loading?n("pulse-loader"):t._e(),t._v(" "),t.loading?t._e():[n("label",{staticClass:"file-input-label",attrs:{for:"import-file-picker"}}),t._v(" "),n("input",{staticClass:"file-input",attrs:{id:"import-file-picker",type:"file",accept:".json"},on:{change:t.setFile}}),t._v(" "),n("button",{staticClass:"button-green export-button file-dummy-button"},[t._v("\n            Import entire document\n          ")])]],2)])])])},i=[]},aS18:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.jsonFileToBackup=e.backupToJsonFile=void 0;var o=u(n("gDS+")),i=u(n("4d7F")),r=u(n("JEAp"));function u(t){return t&&t.__esModule?t:{default:t}}e.backupToJsonFile=function(t,e){return new i.default(function(n){var i=(0,o.default)(e),u=new Blob([i],{type:"application/json"}),a=new Date,c=a.getDate()+"."+(a.getMonth()+1)+"."+a.getFullYear();if(window&&window._integration)return window._pdfSuccess=!0,n();r.default.saveAs(u,t+"--"+c+".json"),n()})},e.jsonFileToBackup=function(t){return new i.default(function(e,n){var o=new FileReader;o.onload=function(){try{var t=o.result;e(JSON.parse(t))}catch(t){n(t)}},o.readAsText(t)})}}}]);
//# sourceMappingURL=3.7aa642449efe81cf84bf.js.map