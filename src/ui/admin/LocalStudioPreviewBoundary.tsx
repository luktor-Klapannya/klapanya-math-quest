import React from 'react';

export class LocalStudioPreviewBoundary extends React.Component<{children:React.ReactNode;resetKey:string},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidUpdate(previous:{resetKey:string}){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false})}
 render(){return this.state.failed?<div className="local-studio-preview-error" role="alert"><strong>PREVIEW ERROR</strong><p>The preview failed inside its isolated area. Local Studio state is unchanged.</p><button onClick={()=>this.setState({failed:false})}>Retry Preview</button></div>:this.props.children}
}
