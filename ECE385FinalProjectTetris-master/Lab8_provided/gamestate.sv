module game_state (input clk, input Reset, input Run, input filled, output start);

enum logic[1:0] {halt, game, done} state, next_state;

always_ff @(posedge clk)
begin
	if(Reset)
		state<=halt;
	else
		state<=next_state;
end

always_comb
begin
	next_state=state;
	unique case (state)
		halt:
			if(Run)
				next_state=game;
		game: 
			if(filled)
				next_state=done;
			else
				next_state=game;
		done:
			if(~Run)
				next_state=halt;
	endcase
	case(state)
		halt:
			start=1'b0;
		game:
			start=1'b1;
		done: 
			start=1'b0;
	endcase
end

endmodule
