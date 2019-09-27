/*
 * ECE385-HelperTools/PNG-To-Txt
 * Author: Rishi Thakkar
 *
 */

module Block
(
		input [9:0] read_address,
		input Clk,
		input [2:0] blockType,
		output logic [23:0] data_Out
);

// mem has width of 3 bits and a total of 400 addresses
logic [23:0] IPiece [0:255];
logic [23:0] LPiece [0:255];
logic [23:0] JPiece [0:255];
logic [23:0] TPiece [0:255];
logic [23:0] SPiece [0:255];
logic [23:0] ZPiece [0:255];
logic [23:0] OPiece [0:255];
logic [23:0] GhostPiece [0:255];

initial
begin
	 $readmemh("IBlockPieceSized.txt", IPiece);
	 $readmemh("LBlockPieceSized.txt", LPiece);
	 $readmemh("JBlockPieceSized.txt", JPiece);
	 $readmemh("TBlockPieceSized.txt", TPiece);
	 $readmemh("SBlockPieceSized.txt", SPiece);
	 $readmemh("ZBlockPieceSized.txt", ZPiece);
	 $readmemh("OBlockPieceSized.txt", OPiece);
	 $readmemh("ghostPiece.txt", GhostPiece);
end


always_ff @ (posedge Clk) 
begin
	if(blockType == 3'd0)
		data_Out<= GhostPiece[read_address];
		
	else if(blockType == 3'd1)
		data_Out<= IPiece[read_address];
	
	else if(blockType == 3'd2)
		data_Out<= LPiece[read_address];
	
	else if(blockType == 3'd3)
		data_Out<= JPiece[read_address];
	
	else if(blockType == 3'd4)
		data_Out<= TPiece[read_address];
	
	else if(blockType == 3'd5)
		data_Out<= SPiece[read_address];
	
	else if(blockType == 3'd6)
		data_Out<= ZPiece[read_address];
	
	else if (blockType == 3'd7)
		data_Out<= OPiece[read_address];
	else
		data_Out <= 24'hFFFFFF;
end


endmodule
