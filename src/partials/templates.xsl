<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

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
					<div>
						<span class="label">Size:</span>
						<span class="value">21px</span>
						<input class="mini-range" type="range" value="34" min="1" max="200" />
					</div>
					<div>
						<span class="label">Hardness:</span>
						<span class="value">81%</span>
						<input class="mini-range" type="range" value="24" min="0" max="100" />
					</div>
				</div>
			</div>
			<div class="shape-list">
				<xsl:for-each select="./*">
					<div>
						<xsl:if test="@name">
							<xsl:attribute name="style">
								background-image: url(~/icons/brush-preset-<xsl:value-of select="@name"/>.png);
							</xsl:attribute>
						</xsl:if>
					</div>
				</xsl:for-each>
			</div>
			<div class="preview">
				
			</div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
