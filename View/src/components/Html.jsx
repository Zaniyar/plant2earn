import React from 'react'
import {useState} from 'react'
import { useThree} from '@react-three/fiber'

function Html() {
const { innerWidth: width, innerHeight: height } = window;
const [text, settext] = useState("green")  
  setTimeout(x=>{
    settext("work")    
  },2000)
  return (
    <>
      <h1
        style={{
          position: 'absolute',
          top: '50vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#292828',
          fontFamily: "VG",
          fontSize: "60pt"
        }}>
        plant2Earn.
      </h1>
      <h2
        style={{
          position: 'absolute',
          top: '52vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#292828',
          fontFamily: "VG",
        }}>
        make it {text}!
      </h2>
      <h3
        style={{
          position: 'absolute',
          top: '93vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#292828',
          fontFamily: "Consolas",
          fontSize: '15pt',
          width: "300px"
        }}>
        first NFT project with real world value generation!
      </h3>
      <button className='playButton' onClick={(e)=>{window.open("https://ut01tiub6zvr.usemoralis.com/")}}
      style={{
        zIndex: 99,
        position: 'fixed',
        top: '100vh',
        left: '50vw',
        transform: 'translateX(-50%)',
        color: '#292828',
        fontFamily: "Consolas",
        fontSize: '15pt',
        width: "300px",
        background: "hotpink"
      }}>PLAY THE GAME</button>
      <h1
        style={{
          position: 'absolute',
          top: '140vh',
          left: '50vw',
          transform: 'translateX(-65%)',
          color: '#f4b677',
          color: '#292828',
          fontFamily: "VG",
        }}>
        You Play
      </h1>
      <h2
        style={{
          position: 'absolute',
          top: '158vh',
          left: '50vw',
          transform: 'translateX(-65%)',
          color: '#f4f677',
          color: '#292828',
          fontFamily: "VG",

        }}>
         We plant!
      </h2>
      <h1
        style={{
          position: 'absolute',
          top: '250vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#673ab7',
          fontFamily: "VG",
          color: '#292828',
        }}>
        You enjoy!
      </h1>
      <h2
        style={{
          position: 'absolute',
          top: '270vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#673ab7',
          fontFamily: "VG",
          color: '#292828',
        }}>
        We Pay!
      </h2>
      <h1
        style={{
          position: 'absolute',
          top: '360vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#673ab7',
          fontFamily: "VG",
          color: '#292828',
        }}>
        Concept
      </h1>
      <div
      style={{
        position: 'absolute',
        top: '375vh',
        left: '50vw',
        transform: 'translateX(-50%)',
        background: '#673ab7',
        fontFamily: "VG",
      }}>
        <iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSoHBUMo_yxIWqUaO_YbrG-ZMbBQO173qHyi1IVLPcEu1tbGf6JGbRuFO4rw-wXU4UkUYF7FLnYjdHC/embed?start=false&loop=false&delayms=3000" frameBorder="0" width={width-500} height="665" allowFullScreen={true} mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
      </div>

      

      <h1
        style={{
          position: 'absolute',
          top: '460vh',
          left: '50vw',
          transform: 'translateX(-50%)',
          color: '#673ab7',
          fontFamily: "VG",
          color: '#292828',
        }}>
        We grow together!
      </h1>
    </>
  )
}

export { Html }
