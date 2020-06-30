uniform float size;
uniform float scale;
uniform float time;
varying float positionY;
attribute float alphaOffset;
attribute float alphaSpeed;
varying float vAlpha;
attribute vec3 customColor;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
	#include <color_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	// Tips for osscillate value:
	// sin(value) * Amplitude / 2 + (Amplitude / 2 + min)
	vAlpha = sin((alphaOffset + time) / 50.0 * alphaSpeed) * 0.5 + 0.5; // alpha between 0 & 1
	gl_PointSize = size * (sin((position.y + time) / 65.0) * 0.75 + 2.25); // size
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}