import React from 'react';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import placeholderLeaderboard from "../public/PlaceholderLeaderboard.json";
import _LeaderboardData from "../public/Year1Leaderboard.json";
import "./index.css"

function Outline(props) {
    var innerColor = props.inner     
    var innerWidth = props.innerWidth
    var outerColor = props.outer     
    var outerWidth = props.outerWidth
    var contain    = props.contain

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

    console.log(props)
    return (
        <div className="avatar" data-tip={props['data-tip']}>
            <img className="avatarImg" src={src} onError={avatarFallback}/>
            {props.children}
        </div>
    )
}

function TopRanker(props) {
    var [rank, id, name, tag, days, avatar] = props.data
    var rankColor = {
        "1st": "var(--gold)",
        "2nd": "var(--silver)",
        "3rd": "var(--bronze)"
    }[props.place]
    

    return (
        <div className="topRankerWrapper" id={props.id}>
            <div className={`topRanker id${id}`}>
                <div className="topRankLabelWrapper"><h2 className="topRankLabel" style={{ color: `${rankColor}` }}>{props.place}</h2></div>
                <div className="topRankAvatarContainer">
                    <Avatar src={avatar} data-tip={name+tag}>
                        <Outline outer={`${rankColor}`} outerWidth={"calc(0.01 * var(--simulated-viewport-width))"}/>{/* inner={`#fff`} innerWidth={"calc(0.004 * var(--simulated-viewport-width))"} */}
                    </Avatar>
                    <h3 className="topRankName" style={{ color: `${rankColor}` }}>{name}</h3>
                    <h4 className="topRankDays" style={{ color: `${rankColor}` }}>{days} Days</h4>
                </div>
            </div>
        </div>
    )
}

function Top3(props) {
    var data = props.data

    return (
        <div id="top3">
            <TopRanker id="firstPlace" data={data[0]} place={"1st"}/>
            <TopRanker id="secondPlace" data={data[1]} place={"2nd"}/>
            <TopRanker id="thirdPlace" data={data[2]} place={"3rd"}/>
        </div>
    )
}

const disableAvatars = false
function Follower(props) {
    var [rank, id, name, tag, days, avatar] = props.data
    var index = props.index
    var rowType = index%2 == 0 ? "A" : "B"
    var dayText = days != 1 ? "days" : "day"

    return (
        <tr id={"follower"+rank} className={`followerRow row${rowType} id${id}`}>
            <td className="followerRank">{String(rank).padStart(2, '0')}</td>
            <td className="followerAvatar">
                <Avatar src={disableAvatars ? "placeholderAvatar.png" : avatar} data-tip={name+tag}>
                    <Outline inner="var(--pfp-border-color-secondary)" innerWidth={"var(--pfp-border-inner-width)"} outer="var(--pfp-border-color)" outerWidth={"var(--pfp-border-outer-width)"} contain={false}/>
                </Avatar>
            </td>
            <td className="followerName">{name}</td>
            <td className="followerDays">{days}<span className="daysUnit"> {dayText}</span></td>
        </tr>
    )
}

const yOffset = -65
const handleOnSelect = (item) => {
    const element = document.querySelector(`.id${item.id}`)
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    scrollTo(y, 1000)
}

function Leaderboard(props) {
    var data = props.data || placeholderLeaderboard
    var top3 = data.slice(0, 3)
    var ranking = data.slice(3)

    var i = 3
    return (
        <div id="leaderboard">
            <div id="titleArea">
                <h1 id="title">
                    Year 1 Leaderboard
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
                            backgroundColor: "var(--bg-color)",
                            boxShadow: "rgb(0, 0, 0, 0.6) 0px 1px 15px 0px",
                            hoverBackgroundColor: "rgba(255, 255, 255, 0.1)",
                            lineColor: "var(--separator)",
                            zIndex: 4 
                        }}
                        
                    />
                </div>
            </div>
            <div id="searchSpacer"/>
            <div id="rankings">
                <Top3 data={top3}/>
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
                            return <Follower data={x} index={i} key={i}/>
                        })}
                    </tbody>
                </table>
            </div>
            <div id="bg">
                <img id="bgImg" src='/bg.jpg'/>
            </div>
            <ReactTooltip place="right" effect="solid" backgroundColor="var(--tool-tip-color)" offset={{left: -10}}/>
        </div>
    )
}

const debugging = false
const App = () => {
    const [LeaderboardData, setLeaderboardData] = React.useState(null)
    const firstDeployed = React.useRef(true)

    if (firstDeployed.current) {
        firstDeployed.current = false

        if (!debugging) {
	        fetch("https://script.google.com/macros/s/AKfycbzgPqy7Oid90XNlLkcTwzCvLTFhZ1ADMEOoIr1OhqZLMGtNgXJS0dMZbrU2jvIxvxh9/exec").then(res => {
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

ReactDOM.render(<App/>, document.getElementById('app'));