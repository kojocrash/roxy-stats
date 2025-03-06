import React from 'react';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import ReactModal from 'react-modal';
import Toggle from 'react-toggle';
import CalendarHeatmap from 'react-calendar-heatmap';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import placeholderLeaderboard from "../public/PlaceholderLeaderboard.json";
import _LeaderboardData from "../public/Year4Leaderboard.json";
import "./index.css"

function Outline(props) {
    var innerColor = props.inner     
    var innerWidth = props.innerWidth
    var outerColor = props.outer     
    var outerWidth = props.outerWidth
    var contain    = props.contain
    var shouldGlow = props.glow

    var innerStyle = (innerColor && innerWidth) ? {
        border: `${innerWidth} solid`,
        borderColor: innerColor
    } : {}

    var outerStyle = (outerColor && outerWidth) ? {
        border: `${outerWidth} solid`,
        borderColor: outerColor
    } : {}
    
    if (contain) {
        innerStyle.boxSizing = "border-box"
        outerStyle.boxSizing = "border-box"
        innerStyle.zIndex = 2
        outerStyle.zIndex = 2
    }

    if (shouldGlow && outerColor) {
        innerStyle.boxShadow = "0px 0 20px 8px " + outerColor
    }

    return (
        <div className="outlineOuter" style={outerStyle}>
            <div className="outlineInner" style={innerStyle}>
                {props.children}
            </div>
        </div>
    )
}

function scrollTo(to, duration) {
    var start = window.pageYOffset,
        change = to - start,
        currentTime = 0,
        increment = 20;
        
    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        window.scrollTo(window.pageXOffset, val)
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
}

Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const avatarFallback = ({currentTarget}) => {
    currentTarget.onerror = null;
    currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${randomInteger(0, 5)}.png`
}

function Avatar(props) {
    var src = props.src

    return (
        <div className="avatar" data-tip={props['data-tip']}>
            <img className="avatarImg" src={src} onError={avatarFallback}/>
            {props.children}
        </div>
    )
}

function TopRanker(props) {
    var [rank, id, name, tag, days, avatar, activity_binary] = props.data
    
    var rankColor = {
        "1": "var(--gold)",
        "2": "var(--silver)",
        "3": "var(--bronze)"
    }[rank.toString()]

    var rankPos = {
        "1": "1st",
        "2": "2nd",
        "3": "3rd"
    }[rank.toString()]
    
    function displayActivity() {
        props.activityStatsSetter(BigInt(activity_binary))
    }

    return (
        <div className="topRankerWrapper" id={props.id}>
            <div className={`topRanker id${id}`}>
                <div className="topRankLabelWrapper"><h2 className="topRankLabel" style={{ color: `${rankColor}` }}>{rankPos}</h2></div>
                <div className="topRankAvatarContainer">
                    <Avatar src={avatar} data-tip={tag}>
                        <Outline glow outer={`${rankColor}`} outerWidth={"calc(0.01 * var(--simulated-viewport-width))"}/>{/* inner={`#fff`} innerWidth={"calc(0.004 * var(--simulated-viewport-width))"} */}
                    </Avatar>
                    <h3 className="topRankName" style={{ color: `${rankColor}` }}>{name}</h3>
                    <h4 className="topRankDays" style={{ color: `${rankColor}` }}><a title="Show details" onClick={displayActivity}>{days} Days</a></h4>
                </div>
            </div>
        </div>
    )
}

function Top3(props) {
    var data = props.data

    return (
        <div id="top3">
            <TopRanker id="firstPlace" data={data[0]}  activityStatsSetter={props.activityStatsSetter}/>
            <TopRanker id="secondPlace" data={data[1]} activityStatsSetter={props.activityStatsSetter}/>
            <TopRanker id="thirdPlace" data={data[2]}  activityStatsSetter={props.activityStatsSetter}/>
        </div>
    )
}

const disableAvatars = false
function Follower(props) {
    var [rank, id, name, tag, days, avatar, activity_binary] = props.data
    var index = props.index
    var rowType = index%2 == 0 ? "A" : "B"
    var dayText = days != 1 ? "days" : "day"
    
    function displayActivity() {
        let bin = BigInt(activity_binary)
        props.activityStatsSetter(bin)
    }

    return (
        <tr id={"follower"+rank} className={`followerRow row${rowType} id${id}`}>
            <td className="followerRank">{String(rank).padStart(2, '0')}</td>
            <td className="followerAvatar">
                <Avatar src={disableAvatars ? "placeholderAvatar.png" : avatar} data-tip={tag}>
                    <Outline inner="var(--pfp-border-color-secondary)" innerWidth={"var(--pfp-border-inner-width)"} outer="var(--pfp-border-color)" outerWidth={"var(--pfp-border-outer-width)"} contain={false}/>
                </Avatar>
            </td>
            <td className="followerName">{name}</td>
            <td className="followerDays"><a title="Show details" onClick={displayActivity}>{days}<span className="daysUnit"> {dayText}</span></a></td>
        </tr>
    )
}

const yOffset = -65
const handleOnSelect = (item) => {
    const element = document.querySelector(`.id${item.id}`)
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    scrollTo(y, 1000)
}

function getRange(count) {
    return Array.from({ length: count }, (_, i) => i);
}

function shiftDate(date, numDays) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
}

function Leaderboard(props) {
    const [activityBinary, setActivityBinary] = React.useState(-1); // -1 = hidden;
    const [showDate, setShowDateFlag] = React.useState(false);

    function closeActivityModal() {
        setActivityBinary(-1)
    }

    function toggleShowDate(e) {
        setShowDateFlag(e.target.checked);
    }

    var data = props.data || placeholderLeaderboard
    var top3 = data.slice(0, 3)
    var ranking = data.slice(3)

    const bigInt1 = BigInt(1)
    const startDate = new Date(1709757880631) // TODO: find a non-hardcoded method

    var i = 3
    return (
        <div id="leaderboard">
            <div id="titleArea">
                <h1 id="title">
                    Year 4 Summary
                </h1>
            </div>
            <div id="searchArea">
                <div id="searchWrapper">
                    <ReactSearchAutocomplete
                        onSelect={handleOnSelect}
                        items={data.map(x => {
                            return {
	                            "id": x[1],
	                            "name": x[2],
                                "tag": x[3]
                            }
                        })}
                        styling={{
                            height: "100%",
                            border: "unset",
                            fontFamily: "inherit",
                            color: "var(--text-color)",
                            backgroundColor: "var(--header-bg-color)",
                            boxShadow: "rgb(0, 0, 0, 0.6) 0px 1px 15px 0px",
                            hoverBackgroundColor: "rgba(255, 255, 255, 0.1)",
                            lineColor: "var(--separator)",
                            backdropFilter: "blur(4px)",
                            zIndex: 4 
                        }}
                        
                    />
                </div>
            </div>
            <div id="searchSpacer"/>
            <div id="rankings">
                <Top3 data={top3} activityStatsSetter={setActivityBinary}/>
                <table id="followers">
                    <tbody>
                        <tr id="header">
                            <th id="rankHeader"   className="headerLabel">Rank</th>
                            <th id="avatarHeader" className="headerLabel">Avatar</th>
                            <th id="nameHeader"   className="headerLabel">Name</th>
                            <th id="daysHeader"   className="headerLabel">Days</th>
                        </tr>
                        {ranking.map(x => {
                            i += 1
                            return <Follower data={x} index={i} key={i} activityStatsSetter={setActivityBinary}/>
                        })}
                    </tbody>
                </table>
            </div>
            
            <ReactTooltip place="right" effect="solid" backgroundColor="var(--tool-tip-color)" offset={{left: -10}}/>
            <ReactModal 
                className="activityModal"
                overlayClassName="activityModalOverlay"
                isOpen={activityBinary != -1}
                onRequestClose={closeActivityModal}
                contentLabel="Activity Modal"
                ariaHideApp={false}
            >
                {activityBinary >= 0 && 
                    <div className="react-calendar-heatmap">
                        {getRange(365).map(index => {
                            let fill_color = (activityBinary & bigInt1 << BigInt(index)) != 0 ? 'color-filled' : 'color-empty';
                            let tooltipText = `Day ${index+1}`;
                            if (showDate) {
                                let curDate = new Date(startDate.getTime());
                                curDate.setDate(curDate.getDate() + index); 
                                tooltipText = curDate.toLocaleString(navigator.language ?? 'en-US', {month: 'short', day: 'numeric', year: 'numeric'});
                            }
                            return <div className={`square ${fill_color}`} data-tip={tooltipText} key={index}></div>
                        })}
                        <label id="show-date-toggle">
                            <Toggle
                                icons={false}
                                checked={showDate}
                                onChange={toggleShowDate} />
                            <span>Show date</span>
                        </label>
                    </div>
                    
                    // TODO: UNINSTALL THIS PIECE OF GARBO
                    // <CalendarHeatmap
                    //     numDays={365}
                    //     endDate={shiftDate(startDate, 364)}
                    //     values={getRange(365).map(index => {
                    //         return {
                    //             date: shiftDate(startDate, index),
                    //             day: index+1,
                    //             count: (activityBinary & bigInt1 << BigInt(index)) != 0 ? 1 : 0,
                    //         }
                    //     })}
                    //     classForValue={value => {
                    //         if (!value) {
                    //             return 'color-empty';
                    //         }
                    //         return value.count ? 'color-filled' : 'color-empty'
                    //     }}
                    //     showWeekdayLabels={false}
                    //     showMonthLabels={false}
                    //     tooltipDataAttrs={value => {
                    //         return {
                    //         'data-tip': value ? `Day ${value.day}` : `Day undefined`,
                    //         };
                    //     }}
                    //     titleForValue={value => value ? `Day ${value.day}` : ''}
                    //     gutterSize={2}
                    // />
                }
                {activityBinary >= 0 && 
                    <ReactTooltip />
                }
            </ReactModal>
        </div>
    )
}

const debugging = false
const App = () => {
    const [LeaderboardData, setLeaderboardData] = React.useState(
        _LeaderboardData.map(x => {
            return [...x.slice(0, 5), "placeholderAvatar.png", ...x.slice(6)]
        })
    )
    
    const firstDeployed = React.useRef(true)

    if (firstDeployed.current) {
        firstDeployed.current = false

        if (!debugging) {
	        fetch("https://script.google.com/macros/s/AKfycbz5lQGyTmhZ4KZFNnK21FoQWBmfi7kB7cocTuPz2QAq0edQkS7JNB2CCUpznxnxxHl2/exec").then(res => {
	            if (res.status != 200) throw 'Bad Request / Internal Server Error'
	
	            res.json().then(data => {
	                if (data['result'] != 'success') throw 'unsuccessful'
	                setLeaderboardData(data['value'])
	            }).catch(() => {
	                setLeaderboardData(_LeaderboardData)
	            })
	        }).catch(() => {
	            setLeaderboardData(_LeaderboardData)
	        })
        } else {
            setLeaderboardData(_LeaderboardData)
        }
    }

    return <Leaderboard data={LeaderboardData}/>;
}

// ReactModal.setAppElement("#app")
ReactDOM.render(<App/>, document.getElementById('app'));