import React from 'react'
import {useState} from 'react'

function Html() {
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
          fontFamily: "Vogue",
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
          fontFamily: "Vogue",
        }}>
        make it {text}!
      </h2>
      <h1
        style={{
          position: 'absolute',
          top: '140vh',
          left: '50vw',
          transform: 'translateX(-65%)',
          color: '#f4b677',
          color: '#292828',
          fontFamily: "Vogue",
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
          fontFamily: "Vogue",

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
          fontFamily: "Vogue",
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
          fontFamily: "Vogue",
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
          fontFamily: "Vogue",
          color: '#292828',
        }}>
        We grow together!
      </h1>
    </>
  )
}

export { Html }
