<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="layers">
	<xsl:for-each select="./*">
		<div class="row" data-click="select-row">
			<xsl:choose>
				<xsl:when test="@type = 'folder'">
					<div class="icon icon-folder"></div>
				</xsl:when>
				<xsl:when test="@type = 'text'">
					<div class="icon icon-text"></div>
				</xsl:when>
				<xsl:otherwise>
					<div class="thumbnail"><canvas></canvas></div>
				</xsl:otherwise>
			</xsl:choose>
			<div class="name"><xsl:value-of select="@name"/></div>
			<div data-click="toggle-visibility">
				<xsl:attribute name="class">icon
					<xsl:if test="@state = 'hidden'"> icon-eye-off</xsl:if>
					<xsl:if test="@state = 'visible'"> icon-eye-on</xsl:if>
				</xsl:attribute>
			</div>
			<xsl:if test="./Fx"><div class="fx-applied"></div></xsl:if>
		</div>
	</xsl:for-each>
</xsl:template>

<xsl:template name="channels">
	<div class="row" data-channel="rgb" data-click="select-channel">
		<div class="thumbnail"><canvas></canvas></div>
		<div class="name">RGB</div>
		<div class="icon icon-eye-on" data-click="toggle-visibility"></div>
	</div>
	<div class="row" data-channel="red" data-click="select-channel">
		<div class="thumbnail channel-red"><canvas></canvas></div>
		<div class="name">Red</div>
		<div class="icon icon-eye-on" data-click="toggle-visibility"></div>
	</div>
	<div class="row" data-channel="green" data-click="select-channel">
		<div class="thumbnail channel-green"><canvas></canvas></div>
		<div class="name">Green</div>
		<div class="icon icon-eye-on" data-click="toggle-visibility"></div>
	</div>
	<div class="row" data-channel="blue" data-click="select-channel">
		<div class="thumbnail channel-blue"><canvas></canvas></div>
		<div class="name">Blue</div>
		<div class="icon icon-eye-on" data-click="toggle-visibility"></div>
	</div>
</xsl:template>

<xsl:template name="paths">
	<div class="row">
		<div class="thumbnail"><canvas></canvas></div>
		<div class="name">Name of path</div>
	</div>
</xsl:template>

<xsl:template name="knob">
	<div class="inline-menubox" data-ui="doKnob">
		<div class="inline-content">
			<div class="knob"></div>
		</div>
	</div>
</xsl:template>

<xsl:template name="swatches">
	<div class="inline-menubox" data-ui="doSwatches">
		<div class="inline-content swatches">
			<xsl:for-each select="./*">
				<div class="swatch">
					<xsl:attribute name="style">background: <xsl:value-of select="@value"/>;</xsl:attribute>
				</div>
			</xsl:for-each>
		</div>
	</div>
</xsl:template>

<xsl:template name="blend-modes">
	<div class="inline-menubox" data-ui="doSelectbox">
		<div class="inline-content">
			<xsl:for-each select="./*">
				<xsl:choose>
					<xsl:when test="@type = 'divider'"><hr/></xsl:when>
					<xsl:when test="@type = 'option'">
						<div class="option"><xsl:value-of select="@name"/></div>
					</xsl:when>
				</xsl:choose>
			</xsl:for-each>
		</div>
	</div>
</xsl:template>

<xsl:template name="brush-tips">
	<div class="inline-menubox" data-ui="doBrushTips">
		<div class="inline-content brush-tips">
			<div class="tip-presets">
				<div class="rotation">
					<div class="gyro">
						<div class="handle"></div>
						<div class="handle"></div>
						<div class="direction"></div>
					</div>
				</div>
				<div class="ranges">
					<div class="tip-size">
						<span class="label">Size:</span>
						<span class="value" data-suffix="px">21px</span>
						<input type="range" data-change="tip-menu-set-size" class="mini-range" min="1" max="200" />
					</div>
					<div class="tip-hardness">
						<span class="label">Hardness:</span>
						<span class="value" data-suffix="%">81%</span>
						<input type="range" data-change="tip-menu-set-hardness" class="mini-range" min="0" max="100" />
					</div>
				</div>
			</div>
			<div class="shape-list">
				<xsl:for-each select="./*">
					<div data-click="tip-menu-set-tip">
						<xsl:attribute name="data-name">
							<xsl:value-of select="@name"/>
						</xsl:attribute>
						<xsl:attribute name="class">
							<xsl:if test="@type = 'texture'">texture</xsl:if>
							<xsl:if test="@tip = 'round'"> round</xsl:if>
						</xsl:attribute>
						<xsl:attribute name="style">
							--image: url(~/icons/brush-preset-<xsl:value-of select="@name"/>.png);
						</xsl:attribute>
					</div>
				</xsl:for-each>
			</div>
			<div class="preview">
				<canvas></canvas>
			</div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
