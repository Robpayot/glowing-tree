uniform vec3 color;
uniform sampler2D pointTexture;
varying float vAlpha;

void main() {
	gl_FragColor = vec4( color, vAlpha );
	gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
}