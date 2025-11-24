import React from 'react'

const Card = ({allTask}) => {
  return (
    <>
      {
        allTask?.map((allTask,i) => {
            <div className="card border-primary mb-3" style={{maxWidth:'18rem'}} key={i}>
                <div className="card-header">
                    
                </div>
            </div>
        })
      }
    </>
  )
}

export default Card
