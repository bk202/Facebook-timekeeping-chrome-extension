var records;

class Label extends React.Component {
  render() {
    let label = this.props.label;
    let value = this.props.value;
    let className = this.props.className;
    let style = this.props.style;
    return React.createElement('div', {className: "label", style},
      (label) ? label + ": " : "",
      React.createElement('span', {className}, value))
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.RenderPic = this.RenderPic.bind(this);
    this.secToHHMMSS = this.secToHHMMSS.bind(this);
  }

  secToHHMMSS(seconds){
  	var hr = Number(seconds / 3600);
  	hr = Math.floor(hr);
  	seconds = Number(seconds % 3600);
  	var min = Number(seconds / 60);
  	min = Math.floor(min);
  	seconds = Number(seconds % 60);
  	return '' + hr + ' HOUR(S) ' + min + ' MINUTE(S) ' + seconds + ' SECOND(S) ';
  }

  RenderPic(){
  	let timeStyle = {fontSize: 13};
  	var _this = this;
    return this.props.records.map(function (record) {
        return React.createElement("div",{key: record.profileName, className: "wrapper"},
          React.createElement("img", { src: record.profilePic, width: "95", height: "84" }, null),
          React.createElement(Label, {label: "Profile name", value: record.profileName, style: timeStyle, className: "green"}),
          React.createElement(Label, {label: "Time spent on this profile", value: _this.secToHHMMSS(record.timeOnFB), style: timeStyle, className: "green"})
        );
      });
  }

   render() {
   	let timeStyle = {fontSize: 16};
    return React.createElement('div', null,
    React.createElement('div', {className: "topicWrapper"}, React.createElement(Label, {label: "You have been on Facebook for", value: this.secToHHMMSS(this.props.totalTimeOnFB), style: timeStyle, className: "green"})),
    React.createElement('br', null, null),
    	this.RenderPic()
    )
  }

}

chrome.runtime.sendMessage({}, function(response){
  ReactDOM.render(
    React.createElement(App, {records: response.records, totalTimeOnFB: response.totalTimeOnFB}, null),
      document.getElementById('root')
    )
});