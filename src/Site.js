import React, { Component } from 'react';
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck, faExclamationCircle, faAngleRight, faArrowsAlt, faMap, faChartLine } from '@fortawesome/free-solid-svg-icons'
import Map from './Map.js';
import Chart from './Chart.js';

class Site extends Component {
    constructor(props) {
        super(props);
        this.state = {
            readings: [],
            devices: [],
            siteDevices: [],
            dictionary: {},
            device: 0,
            checkNew: false,
            showMap: false,
            alertText: '',
            time: 0,
            // center: {
            //     lat: 40.7484,
            //     lng: -73.9845
            // },
            move: false,
            center: {
                lat: 36.153980,
                lng: -95.992775
            },
            zoom: 11,
            selectedDevice: false
        };
    }

    componentWillMount() {
        this.getData();
        setInterval(this.getData, 5000);
    }

    moveDevice = (lat, lng) => {
        let la = Number(lat),
            ln = Number(lng);
        this.setState({ center: { lat: la, lng: ln}, move: false });
    };

    getData = () => {
        console.log('fire');
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/devices?siteId=1&state=1')
            .then(rsp => rsp.json())
            .then(data => {
                // let list = [],
                //     deviceList = [];
                //     data.map(obj => data.map(o => {
                //     if (!deviceList.includes(o.objectId)) {
                //         deviceList.push(o.objectId);
                //     }
                //     if (obj.objectId === o.objectId) {
                //         if (obj.versionTime < o.versionTime) {
                //             list.pop(obj);
                //             list.push(o);
                //         }
                //     }
                //     })
                // );
                this.setState({ siteDevices: data, time: new Date().toLocaleString() });
                // if (this.props.allDevices.length < 1) {
                //     this.props.allDevices.push(...deviceList);
                // }
                // else {
                //     this.checkForNewDevices(deviceList);
                // }
            });
    };

    checkForNewDevices = (deviceList) => {
        deviceList.map((item) => {
            if (!this.props.allDevices.includes(item)) {
                this.props.allDevices.push(item);
                this.newDevice(item);
            }
        });
    };

    newDevice = (id) => {
        let text = 'Device ID #' + id + ' was detected. Refresh page for data.';
        this.setState({ alertText: text });
    };

    testNewDevice = () => {
        const testList = [1,2];
        this.checkForNewDevices(testList);
    };

    checkNew = () => {
        this.setState({ checkNew: true });
        this.interval = setInterval(() => this.getData(), 1000);
    };

    stopCheck = () => {
        this.setState({ checkNew: false, selectedDevice: false });
        clearInterval(this.interval);
    };

    drillInterval = (deviceId, lat, lon) => {
        this.drillDown(deviceId, lat, lon);
        this.interval = setInterval(() => this.drillDown(deviceId, lat, lon), 10000);
        this.setState({ selectedDevice: true });
    };

    deviceFocus = (deviceId, lat, lon) => {
        let center = {lat: lat, lng: lon};
        this.setState({ center, zoom: 13 });
    };


    drillDown = (deviceId, lat, lon) => {
        // let center = {lat: lat, lng: lon};
        // this.setState({ center, zoom: 13 });
        console.log('loading details...');
        this.setState({ zoom: 13 });
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/tags?deviceId=' + deviceId)
            .then(rsp => rsp.json())
            .then(data => this.setState({ dictionary: data, device: deviceId }))
            .then(() =>
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/measurements/last?siteId=' + deviceId)
            .then(rsp => rsp.json())
            .then(data => {
                    let list = data;
                    data.map(obj => data.map(o => {
                            if (obj.id === o.id && obj.time < o.time) {
                                list.pop(obj);
                            }
                        })
                    );
                    this.setState({ readings: list })
                }
            )
        );
    };

  render() {
    if(this.state.siteDevices.length < 1) {
        return true;
    }
    return (
      <div className="Site">
        <div className={this.state.move ? 'move active' : 'move'}>
            <button type="button" onClick={() => this.setState({ move: false })}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="moveModal">
                <h3>Move Device</h3>
                <button type="button" onClick={() => {this.refs.lat.value = 36.1699; this.refs.lon.value = -115.1398}}>Las Vegas</button>
                <button type="button" onClick={() => {this.refs.lat.value = 35.4676; this.refs.lon.value = -97.5164}}>OK City</button>
                <button type="button" onClick={() => {this.refs.lat.value = 33.2788514; this.refs.lon.value = -117.1976852}}>Bonsall, CA</button>
                <button type="button" onClick={() => {this.refs.lat.value = 33.6746665; this.refs.lon.value = -117.6518087}}>Foothill Ranch, CA</button>
                <input type="text" ref="lat" placeholder="latitude" />
                <input type="text" ref="lon" placeholder="longitude" />
                <button type="button" className="submit" onClick={() => this.moveDevice(this.refs.lat.value, this.refs.lon.value)}>Move Device</button>
            </div>
        </div>
        <div className={this.state.alertText.length ? 'alert active' : 'alert'}>
            <FontAwesomeIcon icon={faExclamationCircle} className="alertIcon" />
            <FontAwesomeIcon icon={faAngleRight} className="angle" />
            {this.state.alertText}
        </div>
        <div className="siteBar">
            Northeast > Site One
            <button type="button" className={this.state.showMap ? 'hide' : ''} onClick={() => this.setState({ showMap: true })}><FontAwesomeIcon icon={faMap}/></button>
            <button type="button" className={this.state.showMap ? '' : 'hide'} onClick={() => this.setState({ showMap: false })}><FontAwesomeIcon icon={faChartLine}/></button>
        </div>
        {this.state.showMap && <Map data={this.state.siteDevices} center={this.state.center} zoom={this.state.zoom} iconClick={this.drillInterval} />}
        {!this.state.showMap && <Chart />}
        <div className="content">
            <div className={this.state.selectedDevice ? 'details active' : 'details'}>
                <button type="button" onClick={() => this.stopCheck()}>
                    <FontAwesomeIcon icon={faTimes}/>
                </button>
                <div className="detailsContent">
                    <h3>Tank Stick {this.state.device}</h3>
                    <table>
                        <tbody>
                        <tr>
                            <th>Reading</th>
                            <th>Value</th>
                            <th>Time</th>
                            <th>Alert Status</th>
                        </tr>
                    {
                        this.state.selectedDevice && this.state.readings.map((item, i) => {
                            if (i > 6) {
                                return (<tr key={i}>
                                    <td className="label">
                                        {i === 7 && 'Upper Level'}
                                        {i === 8 && 'Interface Level'}
                                        {i === 9 && 'Bottom Level'}
                                        {i === 10 && 'Total Volume'}
                                        {i === 11 && 'Oil Volume'}
                                        {i === 12 && 'Water Volume'}
                                        {i === 13 && 'Temperature'}
                                    </td>
                                    <td className="value">{item.value}{i === 13 ? '°F' : ''}</td>
                                    <td className="time"><Moment unix format="MM/DD/YYYY h:mm A">{item.time}</Moment>
                                    </td>
                                    <td className="time"><span className="online"/></td>
                                </tr>)
                            }
                        })
                    }
                    </tbody>
                </table>
                </div>
            </div>
            <div className="prodColumn">
                <h3>Devices</h3>
                <table>
                    <tbody>
                        <tr>
                            <th>Status</th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Connected</th>
                            <th>Operational</th>
                            <th>Last Updated</th>
                            <th>Move</th>
                        </tr>
                        {
                            this.state.siteDevices.map((item, i) => {
                                let status = 'red';
                                if (item.connectionState === 1 && item.operationalState === 1) {
                                    status = 'green';
                                }
                                if (item.connectionState === 1 && item.operationalState !== 1) {
                                    status = 'yellow';
                                }
                                return(
                                    <tr key={i} onClick={() => this.deviceFocus(item.objectId, this.state.center.lat, this.state.center.lng)}>
                                        <td className="center"><span className={status} /></td>
                                        <td>{item.name}</td>
                                        {/*<td>{JSON.parse(item.infoRaw).location.type.GPS.latitude},{JSON.parse(item.infoRaw).location.type.GPS.longitude}</td>*/}
                                        <td>{this.state.center.lat}, {this.state.center.lng}</td>
                                        <td className="center">{item.connectionState === 1 ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}</td>
                                        <td className="center">{item.operationalState === 1 ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}</td>
                                        {/*<td className="center">*/}
                                            {/*<Moment unix format="MM/DD/YYYY h:mm A">*/}
                                                {/*{item.versionTime}*/}
                                            {/*</Moment>*/}
                                        {/*</td>*/}
                                        <td className="center">
                                            <Moment format="MM/DD/YYYY h:mm A">
                                                {this.state.time}
                                            </Moment>
                                        </td>
                                        <td className="center">
                                            <button type="button" className="moveDevice" onClick={() => this.setState({ move: true })}>
                                                <FontAwesomeIcon icon={faArrowsAlt} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
        <div className="hide">
          <button type="button" onClick={() => this.testNewDevice()}>Test New Device</button>
          <button type="button" className={this.state.checkNew ? 'hide' : ''} onClick={() => this.checkNew()}>Check</button>
          <button type="button" className={this.state.checkNew ? '' : 'hide'} onClick={() => this.stopCheck()}>Stop</button>
        </div>
      </div>
    );
  }
}

export default Site;
