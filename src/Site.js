import React, { Component } from 'react';
import Moment from 'react-moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import Map from './Map.js';

class Site extends Component {
    constructor(props) {
        super(props);
        this.state = {
            readings: [],
            devices: [],
            siteDevices: [],
            dictionary: {},
            device: 0,
            selectedDevice: false
        };
    }

    componentWillMount() {
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/devices?siteId=1')
            .then(rsp => rsp.json())
            .then(data => {
                let list = [];
                    data.map(obj => data.map(o => {
                    if (obj.objectId === o.objectId) {
                        if (obj.versionTime < o.versionTime) {
                            list.pop(obj);
                            list.push(o);
                        }
                    }
                    })
                );
                this.setState({ devices: data, siteDevices: list });
            });
    }

    loadDictionary = (deviceId) => {
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/tags?deviceId=' + deviceId)
            .then(rsp => rsp.json())
            .then(data => this.setState({ dictionary: data, device: deviceId }))
    };

    drillDown = (deviceId) => {
        this.loadDictionary(deviceId);
        fetch('http://ec2-3-93-75-138.compute-1.amazonaws.com/api/v1/measurements?siteId=' + deviceId)
            .then(rsp => rsp.json())
            .then(data => this.setState({ readings: data, selectedDevice: true }))
    };

  render() {
    if(this.state.devices.length < 1) {
        return true;
    }
    return (
      <div className="Site">
        <div className="siteBar">
            region 01 c01 > site 01 r01
        </div>
        <Map data={this.state.devices} />
        <div className="content">
            <div className={this.state.selectedDevice ? 'details active' : 'details'}>
                <button type="button" onClick={() => this.setState({ selectedDevice: false })}>
                    <FontAwesomeIcon icon={faTimes}/>
                </button>
                <h3>Device ID #{this.state.device}</h3>
                <table>
                    <tbody>
                    <tr>
                        <th>Reading</th>
                        <th>Value</th>
                        <th>Time</th>
                    </tr>
                {
                    this.state.selectedDevice && this.state.readings.map((item, i) => {
                        return (<tr key={i}>
                            <td className="label">{this.state.dictionary.map((ent) => {
                            if(item.id === ent.id) {
                            return ent.name;
                            }
                            return null;
                        }
                        )}
                            </td>
                            <td className="value">{item.value}</td>
                            <td className="time"><Moment format="MM/DD/YYYY h:mm A">{item.time}</Moment></td>
                        </tr>)
                    })
                }
                </tbody>
            </table>
            </div>
            <div className="prodColumn">
                <h3>Devices</h3>
                <table>
                    <tbody>
                        <tr>
                            <th>Status</th>
                            <th>Name</th>
                            <th>Device ID</th>
                            <th>Location</th>
                            <th>Connected</th>
                            <th>Operational</th>
                            <th>Last Updated</th>
                        </tr>
                        {
                            this.state.siteDevices.map((item, i) => {
                                return(
                                    <tr key={i} onClick={() => this.drillDown(item.objectId)}>
                                        <td className="center">{item.state === 1 ? <span className="online" /> : <span className="offline" /> }</td>
                                        <td>{item.name}</td>
                                        <td>{item.objectId}</td>
                                        <td>{JSON.parse(item.infoRaw).location.type.GPS.latitude},{JSON.parse(item.infoRaw).location.type.GPS.longitude}</td>
                                        <td className="center">{item.connectionState === 1 ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}</td>
                                        <td className="center">{item.operationalState === 1 ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}</td>
                                        <td className="center">
                                            <Moment format="MM/DD/YYYY h:mm A">
                                                {item.versionTime}
                                            </Moment>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }
}

export default Site;
