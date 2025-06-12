import pandas as pd
import numpy as np

def analyze_multi_agent_benchmark(csv_file_path):
    """
    Analyze multi-agent system benchmark data
    
    Parameters:
    csv_file_path (str): Path to the CSV file containing benchmark data
    
    Returns:
    dict: Analysis results containing global agent and individual agent metrics
    """
    
    # Read the CSV file
    try:
        df = pd.read_csv(csv_file_path)
        print(f"Successfully loaded {len(df)} records from {csv_file_path}")
    except FileNotFoundError:
        print(f"Error: File {csv_file_path} not found.")
        return None
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return None
    
    # Display basic info about the dataset
    print(f"\nDataset Overview:")
    print(f"Total questions: {len(df)}")
    print(f"Columns: {list(df.columns)}")
    
    # Global Agent Analysis
    print("\n" + "="*50)
    print("GLOBAL AGENT ANALYSIS")
    print("="*50)
    
    # Calculate routing accuracy
    correct_routing = df['expected_agent'] == df['selected_agent']
    correctly_routed = correct_routing.sum()
    incorrectly_routed = len(df) - correctly_routed
    success_rate = (correctly_routed / len(df)) * 100
    
    print(f"Correctly sent to right agent: {correctly_routed}")
    print(f"Sent to wrong agent: {incorrectly_routed}")
    print(f"Success rate: {success_rate:.2f}%")
    
    # Show routing breakdown by expected vs selected agent
    print(f"\nRouting Breakdown:")
    routing_matrix = pd.crosstab(df['expected_agent'], df['selected_agent'], 
                                margins=True, margins_name="Total")
    print(routing_matrix)
    
    # Individual Agent Analysis
    print("\n" + "="*50)
    print("INDIVIDUAL AGENT ANALYSIS")
    print("="*50)
    
    agent_stats = {}
    
    # Get unique agents (from both expected and selected columns)
    all_agents = set(df['expected_agent'].unique()) | set(df['selected_agent'].unique())
    
    for agent in sorted(all_agents):
        # Get responses for this agent (where it was selected)
        agent_responses = df[df['selected_agent'] == agent]
        
        if len(agent_responses) > 0:
            ratings = agent_responses['llb_evaluation']
            avg_rating = ratings.mean()
            highest_rating = ratings.max()
            lowest_rating = ratings.min()
            total_responses = len(agent_responses)
            
            # Calculate how many times this agent was correctly selected
            correctly_selected = agent_responses[agent_responses['expected_agent'] == agent]
            correct_selections = len(correctly_selected)
            
            agent_stats[agent] = {
                'total_responses': total_responses,
                'correct_selections': correct_selections,
                'avg_rating': avg_rating,
                'highest_rating': highest_rating,
                'lowest_rating': lowest_rating,
                'accuracy_when_selected': (correct_selections / total_responses) * 100 if total_responses > 0 else 0
            }
            
            print(f"\nAgent {agent}:")
            print(f"  Total responses handled: {total_responses}")
            print(f"  Correctly selected: {correct_selections}")
            print(f"  Accuracy when selected: {agent_stats[agent]['accuracy_when_selected']:.2f}%")
            print(f"  Average LLB rating: {avg_rating:.2f}")
            print(f"  Highest rating: {highest_rating}")
            print(f"  Lowest rating: {lowest_rating}")
    
    # Overall Statistics
    print("\n" + "="*50)
    print("OVERALL STATISTICS")
    print("="*50)
    
    overall_avg_rating = df['llb_evaluation'].mean()
    overall_highest_rating = df['llb_evaluation'].max()
    overall_lowest_rating = df['llb_evaluation'].min()
    rating_std = df['llb_evaluation'].std()
    
    print(f"Overall average LLB rating: {overall_avg_rating:.2f}")
    print(f"Overall highest rating: {overall_highest_rating}")
    print(f"Overall lowest rating: {overall_lowest_rating}")
    print(f"Rating standard deviation: {rating_std:.2f}")
    
    # Questions with wrong routing
    wrong_routing = df[df['expected_agent'] != df['selected_agent']]
    if len(wrong_routing) > 0:
        print(f"\n" + "="*50)
        print("INCORRECTLY ROUTED QUESTIONS")
        print("="*50)
        for idx, row in wrong_routing.iterrows():
            print(f"\nQuestion: {row['question'][:100]}...")
            print(f"Expected Agent: {row['expected_agent']}")
            print(f"Selected Agent: {row['selected_agent']}")
            print(f"LLB Rating: {row['llb_evaluation']}")
    
    # Return results as dictionary
    results = {
        'global_agent': {
            'correctly_routed': correctly_routed,
            'incorrectly_routed': incorrectly_routed,
            'success_rate': success_rate,
            'routing_matrix': routing_matrix
        },
        'agents': agent_stats,
        'overall': {
            'avg_rating': overall_avg_rating,
            'highest_rating': overall_highest_rating,
            'lowest_rating': overall_lowest_rating,
            'rating_std': rating_std
        }
    }
    
    return results

# Example usage
if __name__ == "__main__":
    # Replace with your CSV file path
    csv_file_path = "benchmar_2.csv"
    
    # Run the analysis
    results = analyze_multi_agent_benchmark(csv_file_path)
    
    # You can also access specific metrics programmatically
    if results:
        print(f"\n" + "="*50)
        print("SUMMARY METRICS")
        print("="*50)
        print(f"Global Agent Success Rate: {results['global_agent']['success_rate']:.2f}%")
        print(f"Overall Average Rating: {results['overall']['avg_rating']:.2f}")
        print(f"Overall Highest Rating: {results['overall']['highest_rating']}")
        
        # Best performing agent by average rating
        best_agent = max(results['agents'].items(), 
                        key=lambda x: x[1]['avg_rating'])
        print(f"Best performing agent: Agent {best_agent[0]} (avg rating: {best_agent[1]['avg_rating']:.2f})")